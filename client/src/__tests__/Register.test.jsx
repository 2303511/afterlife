// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';

// 1) mock axios
jest.mock('axios');

// 2) mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3) stub grecaptcha before component mounts
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

    // personal details fields
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();

    // date of birth (fallback to name selector)
    const dobInput = screen.queryByLabelText(/date of birth/i)
      || document.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // nationality select
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // address / postal / unit / password
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter postal code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter unit number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits form and navigates to setup-2fa when 2FA is enabled', async () => {
    // arrange: mock API response for 2FA flow
    axios.post.mockResolvedValue({
      data: {
        success: true,
        redirectTo: '/setup-2fa',
        twoFAEnabled: true,
      },
    });

    render(<Register />);

    // fill out form fields
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');

    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');
    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit the form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      // 1) reCAPTCHA was executed
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );

      // 2) API call happened (we don't care about exact payload here)
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.any(Object),
        expect.any(Object)
      );

      // 3) navigation goes to setup-2fa
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
