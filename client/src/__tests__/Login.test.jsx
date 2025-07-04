// client/src/__tests__/Login.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import Login from '../pages/public/Login';

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

// stub grecaptcha before component mounts
beforeAll(() => {
  Object.defineProperty(window, 'grecaptcha', {
    configurable: true,
    value: {
      execute: jest.fn().mockResolvedValue('test-token'),
    },
  });
});

// mock the ForgetPasswordModal stub
jest.mock('../pages/public/ForgetPasswordModal', () => {
  const React = require('react');
  return ({ show }) => (
    <div data-testid="forget-modal" data-show={show ? 'true' : 'false'}>
      ForgetPasswordModal
    </div>
  );
});

describe('Login Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
  });

  it('renders email, password, buttons and register link', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /forgot password\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /log in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /register here!/i })
    ).toBeInTheDocument();

    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'false');
  });

  it('executes reCAPTCHA and navigates to my-booking on success', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'foo@bar.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      // recaptcha called
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'login' }
      );
      // API called with some payload
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/login',
        expect.any(Object),
        expect.any(Object)
      );
      // redirect
      expect(mockNavigate).toHaveBeenCalledWith('/my-booking');
    });
  });

  it('shows "Incorrect email or password." on 401', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'bad@creds.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'nopass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/incorrect email or password\./i)
      ).toBeInTheDocument();
    });
  });

  it('shows generic error on other failures', async () => {
    axios.post.mockRejectedValue(new Error('oops'));

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'u@v.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it('opens the forgot-password modal when clicked', async () => {
    render(<Login />);

    await userEvent.click(
      screen.getByRole('button', { name: /forgot password\?/i })
    );

    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'true');
  });
});
