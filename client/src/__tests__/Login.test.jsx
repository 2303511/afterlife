import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import Login from '../pages/public/Login';

// ---- mocks ----

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

// mock AuthContext so that useContext(AuthContext).login exists
const mockLogin = jest.fn();
jest.mock('../../auth/AuthContext', () => {
  const React = require('react');           // pull React in here
  return {
    AuthContext: React.createContext({ login: mockLogin }),
  };
});

// mock ForgetPasswordModal to expose its `show` prop via a test-id
jest.mock('../pages/public/ForgetPasswordModal', () => {
  const React = require('react');
  return ({ show, onHide }) => (
    <div data-testid="forget-modal" data-show={show ? 'true' : 'false'}>
      ForgetPasswordModal
    </div>
  );
});

// stub grecaptcha before any component mounts
beforeAll(() => {
  Object.defineProperty(window, 'grecaptcha', {
    configurable: true,
    value: {
      execute: jest.fn().mockResolvedValue('test-token'),
    },
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
  });

  it('renders email, password, buttons and link', () => {
    render(<Login />);

    // inputs
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // buttons
    expect(
      screen.getByRole('button', { name: /forgot password\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /log in/i })
    ).toBeInTheDocument();

    // register link
    expect(
      screen.getByRole('link', { name: /register here!/i })
    ).toBeInTheDocument();

    // modal stub always rendered but hidden
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
      // reCAPTCHA should run
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'login' }
      );
      // API call with recaptcha token
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/login',
        { email: 'foo@bar.com', password: 'secret123', recaptchaToken: 'test-token' },
        expect.any(Object)
      );
      // redirect to my-booking
      expect(mockNavigate).toHaveBeenCalledWith('/my-booking');
    });
  });

  it('shows "Incorrect email or password." on 401', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'weifeng2604@gmail.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'P@ssw0rd');
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

    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'weifeng2604@gmail.com');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'P@ssw0rd');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it('opens the forgot-password modal when clicked', async () => {
    render(<Login />);

    const btn = screen.getByRole('button', { name: /forgot password\?/i });
    await userEvent.click(btn);

    const modal = screen.getByTestId('forget-modal');
    expect(modal).toHaveAttribute('data-show', 'true');
  });
});
