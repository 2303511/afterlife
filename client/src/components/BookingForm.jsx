import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function BookingForm({ selectedSlot, onCancel }) {
  const [formData, setFormData] = useState({ name: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit Booking:", formData, selectedSlot);
    // TODO: send to backend
    onCancel(); // Close form
  };

  return (
    <div className="booking-form card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Book Slot: {selectedSlot.niche_code}</h4>
        <Button variant="outline-danger" onClick={onCancel}>×</Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Applicant Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            required
          />
        </Form.Group>

        {/* More fields can go here */}

        <Button type="submit" variant="success">Confirm Booking</Button>
      </Form>
    </div>
  );
}
