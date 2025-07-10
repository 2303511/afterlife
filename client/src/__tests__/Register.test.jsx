// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Register from '../pages/public/Register';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

// Stub grecaptcha before component mounts
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
  });

  it('navigates to setup-2fa when 2FA setup is required', async () => {
    console.log('Start: 2FA setup required flow');
    axios.post.mockResolvedValue({
      data: { success: true, redirectTo: '/setup-2fa', twoFASetupRequired: true }
    });

    console.log('Render form');
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    console.log('Fill required fields');
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser2fa');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), '2fa@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'TwoFA User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '87654321');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1992-02-02');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '456 TwoFA Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '654321');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '456');
    await userEvent.click(screen.getByLabelText(/^female$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'secure456');

    console.log('Submit form');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    console.log('Await assertions');
    await waitFor(() => {
      console.log('Asserting navigation to /setup-2fa');
      expect(window.grecaptcha.execute).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
    console.log('Successfully redirected to /setup-2fa');
  });

  console.log('Beginning invalid input assertions.');
  it('does not submit with invalid NRIC format', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill all other fields validly
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'validuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'valid@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Valid User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '87654321');
    await userEvent.clear(document.querySelector('input[name="dob"]'));
    await userEvent.type(document.querySelector('input[name="dob"]'), '1990-01-01');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '1 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '10-10');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'validpass');

    await userEvent.clear(screen.getByPlaceholderText(/enter nric/i));
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('Invalid NRIC assertion passed');
  });

  it('does not submit with underage DOB', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill all other fields validly
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'validuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'valid@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Valid User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '87654321');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '1 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '10-10');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'validpass');

    await userEvent.clear(document.querySelector('input[name="dob"]'));
    await userEvent.type(document.querySelector('input[name="dob"]'), '2010-01-01');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('Underage DOB assertion passed');
  });

  it('does not submit with short contact number', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill other fields validly
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'validuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'valid@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Valid User');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.clear(screen.getByPlaceholderText(/enter contact number/i));
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345');
    await userEvent.clear(document.querySelector('input[name="dob"]'));
    await userEvent.type(document.querySelector('input[name="dob"]'), '1990-01-01');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '1 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '10-10');
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'validpass');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('Invalid contact number assertion passed');
  });

  it('does not submit with short password', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill other fields validly
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'validuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'valid@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Valid User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '87654321');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');
    await userEvent.clear(document.querySelector('input[name="dob"]'));
    await userEvent.type(document.querySelector('input[name="dob"]'), '1990-01-01');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '1 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '10-10');

    await userEvent.clear(screen.getByPlaceholderText(/enter password/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'short');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('Insufficient length password assertion passed');
  });
});
