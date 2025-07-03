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
    // stub reCAPTCHA to avoid script loading and to provide a token
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

    // date input via name selector
    const dobInput = screen.getByLabelText(/date of birth/i) || document.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // radio inputs by exact label match
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to login on success', async () => {
    // arrange: mock successful response with expected fields
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/login', twoFAEnabled: false },
    });

    render(<Register />);

    // fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');

    // date input
    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    // nationality select
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /nationality/i }), 'Singaporean');

    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');

    // select gender via exact label match
    await userEvent.click(screen.getByLabelText(/^male$/i));

    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      // ensure reCAPTCHA execute was called
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );

      // ensure axios.post was called with form data including token
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          fullname: 'Test User',
          contactnumber: '12345678',
          nric: 'S1234567A',
          dob: '1990-01-01',
          nationality: 'Singaporean',
          address: '123 Test Street',
          gender: 'Male',
          password: 'password123',
          recaptchaToken: 'test-token',
        }),
        expect.objectContaining({ headers: { 'Content-Type': 'application/json' }, withCredentials: true })
      );

      // ensure navigation to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
