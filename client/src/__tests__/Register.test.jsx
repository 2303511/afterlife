// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  });

  test('renders all form fields and the Register button', () => {
    const { container } = render(<Register />);
    // (same render assertions as before…)  
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    /* … etc … */
    const dobInput = container.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();
    const nationality = container.querySelector('select[name="nationality"]');
    expect(nationality).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to setup-2fa', async () => {
    // Arrange: pretend backend says 2FA is enabled
    axios.post.mockResolvedValue({
      data: { success: true, twoFAEnabled: true, redirectTo: '/setup-2fa' }
    });

    const { container } = render(<Register />);

    // Fill out just the required fields:
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');

    const dob = container.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    const nat = container.querySelector('select[name="nationality"]');
    await userEvent.selectOptions(nat, 'Singaporean');

    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
    await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
    await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');

    await userEvent.click(screen.getByLabelText(/^male$/i));
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // Act: submit
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assert: we navigated to /setup-2fa
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
    });
  });
});
