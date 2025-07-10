// client/src/__tests__/EditAccount.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import EditAccountModal from '../pages/general/EditAccountModal';

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
    console.log('Rendering EditAccountModal with mock profile');
    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    console.log('Checking initial input values');
    expect(screen.getByDisplayValue('olduser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Old Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('old@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Old St')).toBeInTheDocument();
    console.log('Initial render assertions passed');
  });

  it('submits updated data and calls onUpdated on success', async () => {
    console.log('Mocking successful axios.post response');
    axios.post.mockResolvedValue({ data: { success: true } });

    console.log('Rendering EditAccountModal for success flow');
    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    // Update full name
    console.log('Updating full name field');
    const nameInput = screen.getByDisplayValue('Old Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    // Submit form
    console.log('Clicking Save Changes button');
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    // Verify API call and callback
    await waitFor(() => {
      console.log('Verifying that profile is successfully updated');
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
      console.log('Success flow assertions passed');
    });
  });

  it('displays an error message on failure', async () => {
    console.log('Mocking failed axios.post response');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValue(new Error('Server Error'));

    console.log('Now asserting for failed profile update flow');
    render(
      <EditAccountModal
        show={true}
        profile={mockProfile}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    console.log('Clicking Save Changes button to trigger error');
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      console.log('Verifying error message, profile not updated successfully.');
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      expect(onUpdated).not.toHaveBeenCalled();
      console.log('Error flow assertions passed');
    });

    console.error.mockRestore();
  });
});
