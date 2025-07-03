// src/__tests__/Register.test.jsx
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

// 3) Stub grecaptcha before rendering so recaptchaLoaded === true
beforeAll(() => {
  window.grecaptcha = {
    execute: jest.fn().mockResolvedValue('dummy-token'),
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    axios.post.mockReset();
    mockNavigate.mockReset();
    window.grecaptcha.execute.mockReset();
  });

  test('renders all form fields and the Register button', () => {
    const { container } = render(<Register />);

    // placeholders
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // date and nationality
    expect(container.querySelector('input[name="dob"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="nationality"]')).toBeInTheDocument();

    // gender radios
    expect(screen.getByLabelText(/^male$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^female$/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa after registration', async () => {
    // arrange: mock 2FA‐enabled response
    axios.post.mockResolvedValue({
      data: {
        success: true,
        redirectTo: '/setup-2fa',
        twoFAEnabled: true,
      },
    });

    const { container } = render(<Register />);

    // fill out minimal required fields
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.clear(container.querySelector('input[name="dob"]'));
    await userEvent.type(container.querySelector('input[name="dob"]'), '1990-01-01');
    await userEvent.selectOptions(container.querySelector('select[name="nationality"]'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assertions
    await waitFor(() => {
      // 1) axios.post was called
      expect(axios.post).toHaveBeenCalled();

      // 2) payload contains a recaptchaToken key
      const [, payload] = axios.post.mock.calls[0];
      expect(payload).toHaveProperty('recaptchaToken');

      // 3) navigate to /setup-2fa
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
