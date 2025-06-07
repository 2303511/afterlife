import React, { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

import ApplicantDetails from './ApplicantDetails';
import BeneficiaryDetails from './BeneficiaryDetails';

export default function BookingForm({ selectedSlot, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    nationality: "",
    nationalID: "",
    mobileNumber: "",
    address: "",
    postalCode: "",
    unitNumber: "",
    remarks: "",
  });

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
        <h4>New Application</h4>
        <Button variant="outline-danger" onClick={onCancel}>×</Button>
      </div>

      <h6>Slot ID: {selectedSlot.nicheCode}</h6>

      <Form onSubmit={handleSubmit}>
        <ApplicantDetails formData={formData} onChange={handleChange} />
        <BeneficiaryDetails formData={formData} onChange={handleChange} />
        <Button type="submit" variant="success">Confirm Booking</Button>
      </Form>

    </div>
  );
}
