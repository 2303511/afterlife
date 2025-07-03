// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
    // stub reCAPTCHA
    window.grecaptcha = {
      execute: jest.fn().mockResolvedValue('test-token'),
    };
  });

  test('renders all form fields and submit button', () => {
    render(<Register />);

    // text inputs by placeholder
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // date input
    const dobInput = screen.queryByLabelText(/date of birth/i) || document.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to login on success', async () => {
    // arrange
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/login', twoFAEnabled: false },
    });

    render(<Register />);

    // simulate loading of reCAPTCHA script
    const script = await waitFor(() =>
      Array.from(document.querySelectorAll('script')).find((s) =>
        s.src.includes('recaptcha/api.js')
      )
    );
    fireEvent.load(script);

    // fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');

    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    // nationality select
    const nationalitySelect = screen.getByRole('combobox');
    await userEvent.selectOptions(nationalitySelect, 'Singaporean');

    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({ recaptchaToken: 'test-token' }),
        expect.objectContaining({ withCredentials: true })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
