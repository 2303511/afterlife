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

describe('Register Page - 2FA Setup Flow', () => {
  beforeEach(() => {
    axios.post.mockClear();
    mockNavigate.mockClear();
  });

  it('navigates to setup-2fa when 2FA setup is required', async () => {
    // mock API response requiring 2FA setup
    axios.post.mockResolvedValue({ data: { success: true, redirectTo: '/setup-2fa', twoFASetupRequired: true } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // fill minimal required form fields
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser2fa');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), '2fa@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'TwoFA User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '87654321');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S7654321B');

    const dob = document.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1992-02-02');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '456 TwoFA Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '654321');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '456');
    await userEvent.click(screen.getByLabelText(/^female$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'secure456');

    // submit the form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assert navigation to 2FA setup page
    await waitFor(() => {
      expect(window.grecaptcha.execute).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/register',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
