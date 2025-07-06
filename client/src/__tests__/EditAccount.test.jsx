// client/src/__tests__/EditAccount.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import EditAccountModal from '../pages/public/EditAccountModal';

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

    // Using display values since labels aren't associated
    expect(screen.getByDisplayValue('olduser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Old Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('old@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Old St')).toBeInTheDocument();
  });

  it('submits updated data and calls onUpdated on success', async () => {
    // mock success
    axios.post.mockResolvedValue({ data: { success: true } });

    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    // change a field using display value
    const nameInput = screen.getByDisplayValue('Old Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    // click Save Changes
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    // assert axios call
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
      // The component shows "Update failed" on error
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      expect(onUpdated).not.toHaveBeenCalled();
    });
  });
});
