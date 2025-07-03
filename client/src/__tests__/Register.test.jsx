import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';

// 1) Mock axios
jest.mock('axios');

// 2) Mock react-router-dom’s useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3) Stub grecaptcha before running tests
beforeAll(() => {
  window.grecaptcha = {
    execute: jest.fn().mockResolvedValue('dummy-token'),
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
    window.grecaptcha.execute.mockClear();
  });

  test('renders all form fields and the Register button', () => {
    const { container } = render(<Register />);

    // text inputs
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // date of birth and nationality via name selector
    expect(container.querySelector('input[name="dob"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="nationality"]')).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // address, postal code, unit number
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter postal code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter unit number/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa after registration', async () => {
    // arrange: mock API response for 2FA flow
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFAEnabled: true },
    });

    const { container } = render(<Register />);

    // wait for reCAPTCHA script to be appended and loaded
    const script = await waitFor(() =>
      document.querySelector('script[src*="recaptcha/api.js"]')
    );
    fireEvent.load(script);

    // fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');

    const dob = container.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    const nationality = container.querySelector('select[name="nationality"]');
    await userEvent.selectOptions(nationality, 'Singaporean');

    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');

    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );

      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({
          username: 'testuser',
          fullname: 'Test User',
          email: 'test@example.com',
          contactnumber: '12345678',
          nric: 'S1234567A',
          dob: '1990-01-01',
          nationality: 'Singaporean',
          address: '123 Test Street',
          postalcode: '123456',
          unitnumber: '05-01',
          gender: 'Male',
          password: 'password123',
          recaptchaToken: 'dummy-token',
        }),
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
