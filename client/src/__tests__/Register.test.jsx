// client/src/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  });

  test('renders all form fields and submit button', () => {
    const { container } = render(<Register />);

    // text inputs by placeholder
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nric/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter nationality/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

    // date input via name selector
    const dobInput = container.querySelector('input[name="dob"]');
    expect(dobInput).toBeInTheDocument();

    // radio inputs still have htmlFor/id linkage
    expect(screen.getByLabelText(/male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();

    // submit button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('submits form and navigates to login on success', async () => {
    // arrange: mock successful response
    axios.post.mockResolvedValue({ data: { message: 'ok' } });

    const { container } = render(<Register />);

    // fill out form
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/enter email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter full name/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/enter contact number/i), '12345678');
    await userEvent.type(screen.getByPlaceholderText(/enter nric/i), 'S1234567A');

    // date input
    const dob = container.querySelector('input[name="dob"]');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1990-01-01');

    await userEvent.type(screen.getByPlaceholderText(/enter nationality/i), 'Singaporean');
    await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');

    // select gender
    await userEvent.click(screen.getByLabelText(/male/i));

    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

    // submit form
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // assert axios called and navigation happened
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
          nationality: 'Singaporean',
          address: '123 Test Street',
          gender: 'Male',
          password: 'password123',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
