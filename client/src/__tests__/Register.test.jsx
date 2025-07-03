import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

// 3) Stub grecaptcha
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

    // date of birth (use name selector)
    const dobInput = container.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // nationality (use name selector)
    const nationalitySelect = container.querySelector('select[name="nationality"]');
    expect(nationalitySelect).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa', async () => {
    // arrange: mock API response for 2FA flow
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFAEnabled: true },
    });

    const { container } = render(<Register />);

    // fill out the form
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

    // submit
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      // recaptcha executed
      expect(window.grecaptcha.execute).toHaveBeenCalledWith(
        '6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N',
        { action: 'register' }
      );

      // axios.post called with form + token
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.objectContaining({
          username:       'testuser',
          fullname:       'Test User',
          email:          'test@example.com',
          contactnumber:  '12345678',
          nric:           'S1234567A',
          dob:            '1990-01-01',
          nationality:    'Singaporean',
          address:        '123 Test Street',
          postalcode:     '123456',
          unitnumber:     '05-01',
          gender:         'Male',
          password:       'password123',
          recaptchaToken: 'dummy-token',
        }),
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      // navigation
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
