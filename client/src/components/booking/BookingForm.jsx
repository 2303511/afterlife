import React, { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

import ApplicantDetails from './ApplicantDetails';
import BeneficiaryDetails from './BeneficiaryDetails';

export default function BookingForm({ selectedSlot, onCancel, onSubmit }) {
  const [bookingType, setBookingType] = useState("Current"); // default to 'Current'

  const [applicantData, setApplicantData] = useState({
    fullName: "",
    gender: "",
    nationality: "",
    nationalID: "",
    mobileNumber: "",
    address: "",
    postalCode: "",
    unitNumber: "",
    dob: "",
    remarks: ""
  });

  const [beneficiaryData, setBeneficiaryData] = useState({
    beneficiaryName: "",
    beneficiaryGender: "",
    beneficiaryNationality: "",
    beneficiaryNRIC: "",
    dateOfBirth: "",
    dateOfDeath: "",
    relationshipWithApplicant: "",
    inscription: "",
  });

  const [files, setFiles] = useState({
    birthCert: null,
    deathCert: null
  });
  
  const onFileChange = (e, type) => {
    setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
  };

  
  const handleApplicantChange = (e) => {
    setApplicantData({ ...applicantData, [e.target.name]: e.target.value });
  };

  const handleBeneficiaryChange = (e) => {
    setBeneficiaryData({ ...beneficiaryData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    // Append applicant fields
    Object.entries(applicantData).forEach(([key, value]) =>
      formData.append(`applicant[${key}]`, value)
    );
  
    // Append beneficiary fields
    Object.entries(beneficiaryData).forEach(([key, value]) =>
      formData.append(`beneficiary[${key}]`, value)
    );
  
    // Append booking type
    formData.append("bookingType", bookingType);
  
    // Append files
    if (files.birthCert) formData.append("birthCertFile", files.birthCert);
    if (files.deathCert) formData.append("deathCertFile", files.deathCert);
  
    // Append selected slot ID
    formData.append("nicheID", selectedSlot.nicheID);
  
    // Submit to parent
    onSubmit(formData); 
  };
  

  return (
    <div className="booking-form card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>New Application</h4>
        <Button variant="outline-danger" onClick={onCancel}>×</Button>
      </div>

      <h6>Slot ID: {selectedSlot.nicheCode}</h6>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Booking Type</Form.Label>
          <div>
            <Form.Check
              inline
              type="radio"
              label="Current Use"
              name="bookingType"
              value="Current"
              checked={bookingType === "Current"}
              onChange={(e) => setBookingType(e.target.value)}
            />
            <Form.Check
              inline
              type="radio"
              label="Pre-Order"
              name="bookingType"
              value="PreOrder"
              checked={bookingType === "PreOrder"}
              onChange={(e) => setBookingType(e.target.value)}
            />
          </div>
        </Form.Group>

        <ApplicantDetails formData={applicantData} onChange={handleApplicantChange} />
        <BeneficiaryDetails formData={beneficiaryData} onChange={handleBeneficiaryChange} onFileChange={onFileChange} />


        <Button type="submit" variant="success">Confirm Booking</Button>
      </Form>

    </div>
  );
}
