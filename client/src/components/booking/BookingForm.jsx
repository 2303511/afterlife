import React, { useState } from "react";
import { Button, Form, Accordion } from "react-bootstrap";
import ApplicantDetails from './ApplicantDetails';
import BeneficiaryDetails from './BeneficiaryDetails';
import { validateFormData } from '../../utils/validation';
import { applicantRules, applicantFieldLabels, beneficiaryRules, beneficiaryFieldLabels } from '../../utils/validationRules';

export default function BookingForm({ selectedSlot, onCancel, onSubmit }) {
  const [bookingType, setBookingType] = useState("");

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
    address: "",
    postalCode: "",
    unitNumber: ""
  });

  const [files, setFiles] = useState({
    birthCert: null,
    deathCert: null
  });

  const [errors, setErrors] = useState({
    bookingType: '',
    applicant: {},
    beneficiary: {}
  });

  const onFileChange = (e, type) => {
    const file = e.target.files[0];

    if (file) {
      if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
        alert("Invalid file type. Only PDF, PNG, JPG allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Max 5MB.");
        return;
      }

      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleApplicantChange = (e) => {
    let { name, value } = e.target;
  
    // For Mobile Number — only digits
    if (name === "mobileNumber") {
      value = value.replace(/\D/g, ""); // Strip all non-digits
    }
  
    // For Unit Number — digits and hyphen
    if (name === "unitNumber") {
      value = value.replace(/[^0-9\-]/g, "");
    }
  
    // For Postal Code — only digits
    if (name === "postalCode") {
      value = value.replace(/\D/g, "");
    }

    if (name === "nationalID") {
      value = value.toUpperCase();
    }
    
  
    setApplicantData({ ...applicantData, [name]: value });
  };
  

  const handleBeneficiaryChange = (e) => {
    let { name, value } = e.target;
  
    if (name === "postalCode") {
      value = value.replace(/\D/g, "");
    }
  
    if (name === "unitNumber") {
      value = value.replace(/[^0-9\-]/g, "");
    }
  
    if (name === "beneficiaryNRIC") {
      value = value.toUpperCase(); // Optional: auto-capitalise NRIC
    }
  
    setBeneficiaryData({ ...beneficiaryData, [name]: value });
  };
  

  // Helper: calculate step status
  const isBookingTypeValid = !!bookingType;

  const isApplicantValid = Object.keys(
    validateFormData(applicantData, applicantRules, applicantFieldLabels)
  ).length === 0;

  const isBeneficiaryValid = Object.keys(
    validateFormData(beneficiaryData, beneficiaryRules, beneficiaryFieldLabels)
  ).length === 0
    && !!files.birthCert && !!files.deathCert;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate applicant and beneficiary
    const applicantErrors = validateFormData(applicantData, applicantRules, applicantFieldLabels);
    const beneficiaryErrors = validateFormData(beneficiaryData, beneficiaryRules, beneficiaryFieldLabels);

    // Validate files
    if (!files.birthCert) {
      beneficiaryErrors.birthCertFile = `${beneficiaryFieldLabels.birthCertFile} is required`;
    }
    if (!files.deathCert) {
      beneficiaryErrors.deathCertFile = `${beneficiaryFieldLabels.deathCertFile} is required`;
    }

    // Validate booking type
    let bookingTypeError = '';
    if (!bookingType) {
      bookingTypeError = 'Booking Type is required';
    }

    // If any errors, stop submit
    if (bookingTypeError || Object.keys(applicantErrors).length > 0 || Object.keys(beneficiaryErrors).length > 0) {
      setErrors({
        bookingType: bookingTypeError,
        applicant: applicantErrors,
        beneficiary: beneficiaryErrors
      });
      return;
    }

    // No errors → build FormData
    const formData = new FormData();

    Object.entries(applicantData).forEach(([key, value]) => {
      formData.append(`applicant[${key}]`, value);
    });

    Object.entries(beneficiaryData).forEach(([key, value]) => {
      formData.append(`beneficiary[${key}]`, value);
    });

    formData.append("bookingType", bookingType);
    formData.append("nicheID", selectedSlot.nicheID);

    formData.append("birthCertFile", files.birthCert);
    formData.append("deathCertFile", files.deathCert);

    onSubmit(formData);
  };

  return (
    <div className="booking-form card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>New Application</h4>
        <Button variant="outline-danger" onClick={onCancel} aria-label="Cancel Booking Form">×</Button>
      </div>

      <h6>Slot ID: {selectedSlot.nicheCode}</h6>

      <Form onSubmit={handleSubmit}>
        <Accordion defaultActiveKey="0" className="mb-3">

          <Accordion.Item eventKey="0">
            <Accordion.Header>
              Step 1: Booking Type
              <span style={{ color: isBookingTypeValid ? "green" : "orange", marginLeft: '0.5rem' }}>
                {isBookingTypeValid ? "Completed" : "Incomplete"}
              </span>
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3">
                <Form.Label id="bookingTypeLabel">Booking Type</Form.Label>
                <div role="radiogroup" aria-labelledby="bookingTypeLabel">
                  <Form.Check
                    inline
                    type="radio"
                    label="Current Use"
                    name="bookingType"
                    value="Current"
                    checked={bookingType === "Current"}
                    onChange={(e) => setBookingType(e.target.value)}
                    aria-invalid={!!errors.bookingType}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Pre-Order"
                    name="bookingType"
                    value="PreOrder"
                    checked={bookingType === "PreOrder"}
                    onChange={(e) => setBookingType(e.target.value)}
                    aria-invalid={!!errors.bookingType}
                  />
                </div>
                {errors.bookingType && (
                  <div className="invalid-feedback d-block">
                    {errors.bookingType}
                  </div>
                )}
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>
              Step 2: Applicant Details
              <span style={{ color: isApplicantValid ? "green" : "orange", marginLeft: '0.5rem' }}>
                {isApplicantValid ? "Completed" : "Incomplete"}
              </span>
            </Accordion.Header>
            <Accordion.Body>
              <ApplicantDetails
                formData={applicantData}
                onChange={handleApplicantChange}
                errors={errors?.applicant || {}}
              />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>
              Step 3: Beneficiary Details
              <span style={{ color: isBeneficiaryValid ? "green" : "orange", marginLeft: '0.5rem' }}>
                {isBeneficiaryValid ? "Completed" : "Incomplete"}
              </span>
            </Accordion.Header>
            <Accordion.Body>
              <BeneficiaryDetails
                formData={beneficiaryData}
                onChange={handleBeneficiaryChange}
                onFileChange={onFileChange}
                errors={errors?.beneficiary || {}}
              />
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>

        <Button 
          type="submit" 
          variant="success" 
          aria-label="Confirm Booking and Submit Form"
        >
          Confirm Booking
        </Button>
      </Form>
    </div>
  );
}
