// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();

    // 3) Stub out grecaptcha globally and its execute method
    window.grecaptcha = {
      execute: jest.fn().mockResolvedValue('dummy-token'),
    };
  });

  test('renders all form fields and the Register button', () => {
    render(<Register />);

    // placeholders
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // radio labels
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa when 2FA is enabled', async () => {
    // Arrange: mock successful response with twoFAEnabled
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFAEnabled: true },
    });

    const { container } = render(<Register />);

    // 4) Simulate recaptcha script load so recaptchaLoaded becomes true
    const script = document.querySelector('script[src*="recaptcha/api.js"]');
    // (the component's useEffect appends this script)
    fireEvent.load(script);

    // Fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    
    // date input
    const dob = container.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    // select gender
    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // 5) Assert axios called with recaptcha token, and navigate to /setup-2fa
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          fullname: 'Test User',
          contactnumber: '12345678',
          nric: 'S1234567A',
          dob: '1990-01-01',
          nationality: expect.any(String),  // adjust if you select nationality
          address: '123 Test Street',
          gender: 'Male',
          password: 'password123',
          postalcode: '123456',
          unitnumber: '05-01',
          recaptchaToken: 'dummy-token',
        }),
        expect.objectContaining({ headers: { 'Content-Type': 'application/json' }, withCredentials: true })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
