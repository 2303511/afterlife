// client/src/__tests__/EditAccount.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import EditAccountModal from '../pages/EditAccountModal';

jest.mock('axios');

describe('EditAccountModal', () => {
  const mockProfile = {
    username: 'olduser',
    fullName: 'Old Name',
    email: 'old@example.com',
    contactNumber: '12345678',
    userAddress: '123 Old St',
  };
  let onClose, onUpdated;

  beforeEach(() => {
    onClose = jest.fn();
    onUpdated = jest.fn();
    axios.post.mockClear();
  });

  it('renders form fields with profile values', () => {
    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    // Check input values directly
    expect(screen.getByDisplayValue('olduser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Old Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('old@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Old St')).toBeInTheDocument();
  });

  it('submits updated data and calls onUpdated on success', async () => {
    // mock success response
    axios.post.mockResolvedValue({ data: { success: true } });

    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    // Update full name
    const nameInput = screen.getByDisplayValue('Old Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    // Verify API call and callback
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/edit_account',
        {
          username: 'olduser',
          fullName: 'New Name',
          email: 'old@example.com',
          contactNumber: '12345678',
          userAddress: '123 Old St',
        },
        expect.any(Object)
      );
      expect(onUpdated).toHaveBeenCalled();
    });
  });

  it('displays an error message on failure', async () => {
    // Suppress console.error for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    axios.post.mockRejectedValue(new Error('Server Error'));

    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      // The component renders 'Update failed' on error
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      expect(onUpdated).not.toHaveBeenCalled();
    });

    console.error.mockRestore();
  });
});
