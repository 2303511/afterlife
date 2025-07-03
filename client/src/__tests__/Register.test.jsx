import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';

// 1) Mock axios
jest.mock('axios');

// 2) Mock react-router-dom’s useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3) Stub grecaptcha before tests
beforeAll(() => {
  window.grecaptcha = {
    execute: jest.fn().mockResolvedValue('dummy-token'),
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
    window.grecaptcha.execute.mockClear();
  });

  test('renders all form fields and the Register button', () => {
    const { container } = render(<Register />);

    // text inputs
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter postal code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter unit number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // date of birth (no htmlFor on label)
    const dobInput = container.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // nationality (select)
    const nationalitySelect = container.querySelector('select[name="nationality"]');
    expect(nationalitySelect).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa after registration', async () => {
    // arrange: mock API response for 2FA flow
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFAEnabled: true },
    });

    const { container } = render(<Register />);

    // fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');

    const dob = container.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    const nationalitySelect = container.querySelector('select[name="nationality"]');
    await userEvent.selectOptions(nationalitySelect, 'Singaporean');

    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');

    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      // grecaptcha was called
      expect(window.grecaptcha.execute).toHaveBeenCalled();

      // axios.post was called and payload contains a recaptchaToken
      expect(axios.post).toHaveBeenCalled();
      const [, payload, config] = axios.post.mock.calls[0];
      expect(payload).toHaveProperty('recaptchaToken');
      expect(typeof payload.recaptchaToken).toBe('string');

      // credentials flag
      expect(config).toMatchObject({ withCredentials: true });

      // navigation
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
