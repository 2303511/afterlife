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

// Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
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

// Helper to render Login with AuthContext
const renderWithAuth = (ui, loginFn = jest.fn()) => {
  return render(
    <AuthContext.Provider
      value={{
        login: loginFn,
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

  it('executes reCAPTCHA and navigates to my-booking on success', async () => {
    const mockLogin = jest.fn();
    axios.post.mockResolvedValue({ data: { success: true } });

    renderWithAuth(<Login />, mockLogin);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'foo@bar.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'login' }
      );
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/login',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockLogin).toHaveBeenCalled(); // verifies context login()
      expect(mockNavigate).toHaveBeenCalledWith('/my-booking');
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
    axios.post.mockRejectedValue(new Error('network error'));

    renderWithAuth(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@user.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it('opens forgot-password modal when clicked', async () => {
    renderWithAuth(<Login />);

    await userEvent.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'true');
  });
});
