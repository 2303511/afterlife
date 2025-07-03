// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';

// 1) Mock axios
jest.mock('axios');

// 2) Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3) Stub grecaptcha before the component ever mounts
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
    window.grecaptcha.execute.mockClear();
  });

  it('renders all form fields and the Register button', () => {
    render(<Register />);

    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();

    // date input: no htmlFor, so we grab by name:
    expect(document.querySelector('input[name="dob"]')).toBeInTheDocument();

    // nationality select:
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter postal code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter unit number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits form and navigates to /login when 2FA is disabled', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/login', twoFAEnabled: false },
    });

    render(<Register />);
    // fill the form (omitted here for brevity—same as below)
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'u');
    // … fill other fields …
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('submits form and navigates to /setup-2fa when 2FA is enabled', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFAEnabled: true },
    });

    render(<Register />);
    // fill the form exactly the same way:
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'u');
    // … fill other fields …
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
