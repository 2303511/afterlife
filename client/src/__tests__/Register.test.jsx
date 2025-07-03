test('submits form and navigates to setup-2fa after registration', async () => {
  // arrange: mock API response for 2FA flow
  axios.post.mockResolvedValue({
    data: {
      success: true,
      redirectTo: '/setup-2fa',
      twoFAEnabled: true,
    },
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

  const nationalitySelect = container.querySelector('select[name="nationality"]');
  await userEvent.selectOptions(nationalitySelect, 'Singaporean');

  await userEvent.type(screen.getByPlaceholderText(/enter address/i), '123 Test Street');
  await userEvent.type(screen.getByPlaceholderText(/enter postal code/i), '123456');
  await userEvent.type(screen.getByPlaceholderText(/enter unit number/i), '05-01');

  await userEvent.click(screen.getByLabelText(/^male$/i));
  await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'password123');

  // submit
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
        recaptchaToken: 'dummy-token' // Ensure token is passed here
      }),
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
    );

    expect(mockNavigate).toHaveBeenCalledWith('/setup-2fa');
  });
});
