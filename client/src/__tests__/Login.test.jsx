// client/src/__tests__/Login.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Login from '../pages/public/Login';
import { AuthContext } from '../auth/AuthContext';

// Mock axios
jest.mock('axios');

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock reCAPTCHA
beforeAll(() => {
  Object.defineProperty(window, 'grecaptcha', {
    configurable: true,
    value: {
      execute: jest.fn().mockResolvedValue('test-token'),
    },
  });
});

// Mock ForgetPasswordModal
jest.mock('../pages/public/ForgetPasswordModal', () => {
  const React = require('react');
  return ({ show }) => (
    <div data-testid="forget-modal" data-show={show ? 'true' : 'false'}>
      ForgetPasswordModal
    </div>
  );
});

// Helper to render Login with dummy AuthContext
const renderWithAuth = (ui) => {
  return render(
    <AuthContext.Provider
      value={{
        login: jest.fn(),
        logout: jest.fn(),
        user: null,
        loading: false,
      }}
    >
      {ui}
    </AuthContext.Provider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
  });

  it('renders email, password, buttons and register link', () => {
    renderWithAuth(<Login />);
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register here!/i })).toBeInTheDocument();

    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'false');
  });

  it('redirects to login-2fa page when 2FA is required', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        redirectTo: '/login-2fa',
        twoFARequired: true,
      },
    });

    renderWithAuth(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'foo@bar.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login-2fa');
    });
  });

  it('redirects to setup-2fa page when 2FA setup is required', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        redirectTo: '/setup-2fa',
        twoFASetupRequired: true,
      },
    });

    renderWithAuth(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@user.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), '12345678');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });

  it('shows "Incorrect email or password." on 401', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });

    renderWithAuth(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'bad@creds.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'nopass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect email or password\./i)).toBeInTheDocument();
    });
  });

  it('shows generic error on other failures', async () => {
    axios.post.mockRejectedValue(new Error('network fail'));

    renderWithAuth(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'fail@net.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'somepass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong\. please try again\./i)).toBeInTheDocument();
    });
  });

  it('opens forgot-password modal when clicked', async () => {
    renderWithAuth(<Login />);
    await userEvent.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'true');
  });
});
