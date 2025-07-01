import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import Register from '../Register'

// 1) Mock axios.post
jest.mock('axios')

test('fills register form and navigates to /login on success', async () => {
  // Stub the POST to return success
  axios.post.mockResolvedValue({ data: { success: true } })

  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  )

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/^Username$/i), {
    target: { value: 'test100' }
  })
  fireEvent.change(screen.getByLabelText(/^Email$/i), {
    target: { value: 'test100@example.com' }
  })
  fireEvent.change(screen.getByLabelText(/Full Name/i), {
    target: { value: 'Test User' }
  })
  fireEvent.change(screen.getByLabelText(/Contact Number/i), {
    target: { value: '91234567' }
  })
  fireEvent.change(screen.getByLabelText(/^NRIC$/i), {
    target: { value: 'S1234567A' }
  })
  fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
    target: { value: '2000-01-01' }
  })
  fireEvent.change(screen.getByLabelText(/Nationality/i), {
    target: { value: 'Singaporean' }
  })
  fireEvent.change(screen.getByLabelText(/^Address$/i), {
    target: { value: '123 Example St' }
  })
  fireEvent.click(screen.getByLabelText(/^Male$/i))
  fireEvent.change(screen.getByLabelText(/^Password$/i), {
    target: { value: 'SecurePass123!' }
  })

  // Submit
  fireEvent.click(screen.getByRole('button', { name: /register$/i }))

  // Wait for our fake LOGIN PAGE
  await waitFor(() => {
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument()
  })
})
