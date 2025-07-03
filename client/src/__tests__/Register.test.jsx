// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';

// mock axios
jest.mock('axios');

// mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Stub grecaptcha before component mounts
beforeAll(() => {
  Object.defineProperty(window, 'grecaptcha', {
    configurable: true,
    value: {
      execute: jest.fn().mockResolvedValue('test-token'),
    },
  });
});

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
  });

  it('renders all form fields and submit button', () => {
    render(<Register />);

    // personal details
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    const dobInput = screen.queryByLabelText(/date of birth/i) || document.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // nationality
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter postal code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter unit number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits form and navigates to login on success', async () => {
    axios.post.mockResolvedValue({ data: { success: true, redirectTo: '/login', twoFAEnabled: false } });

    render(<Register />);

    // fill personal details
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    // nationality
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');

    // mailing address
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '123');

    // gender & password
    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      // recaptcha
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );
      // api call
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({ recaptchaToken: 'test-token' }),
        expect.objectContaining({ headers: { 'Content-Type': 'application/json' }, withCredentials: true })
      );
      // navigation
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
