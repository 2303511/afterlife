import { useState, useEffect } from "react";
import { Button, Form, Accordion } from "react-bootstrap";
import axios from "axios";

import ApplicantDetails from './ApplicantDetails';
import BeneficiaryDetails from './BeneficiaryDetails';
import { validateFormData } from '../../utils/validation';
import { applicantRules, applicantFieldLabels, beneficiaryRules, beneficiaryFieldLabels } from '../../utils/validationRules';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingForm({ selectedSlot, onCancel, onSubmit, isModal = true, width = 600 }) {
  // const [bookingType, setBookingType] = useState("");
  const [bookingType, setBookingType] = useState("PreOrder");

  // existing modal data
  const [existingUserData, setExistingUserData] = useState(null);
  const [showExistingUserModal, setShowExistingUserModal] = useState(false); // do not show the existing user found modal

  const [applicantData, setApplicantData] = useState({
    fullName: "",
    gender: "",
    nationality: "",
    nationalID: "",
    mobileNumber: "",
    email:"",
    address: "",
    postalCode: "",
    unitNumber: "",
    dob: ""
  });

  const [beneficiaryData, setBeneficiaryData] = useState({
    beneficiaryName: "",
    beneficiaryGender: "",
    beneficiaryNationality: "",
    beneficiaryNRIC: "",
    dateOfBirth: "",
    dateOfDeath: "",
    relationshipWithApplicant: "",
    beneficiaryAddress: "",
    beneficiaryPostalCode: "",
    beneficiaryUnitNumber: ""
  });

	
  // const [applicantData, setApplicantData] = useState({
  //   fullName: "John Doe",
  //   gender: "Male",
  //   nationality: "Singaporean",
  //   nationalID: "S1234567A",
  //   mobileNumber: "91234567",
  //   address: "123 Main Street",
  //   postalCode: "123456",
  //   unitNumber: "01-01",
  //   dob: "1990-01-01"
  // });

  // const [beneficiaryData, setBeneficiaryData] = useState({
  //   beneficiaryName: "Jane Doe",
  //   beneficiaryGender: "Female",
  //   relationshipWithApplicant: "Mother",
  //   beneficiaryNationality: "Singaporean",
  //   beneficiaryNRIC: "S1234567A",
  //   dateOfBirth: "1995-01-01",
  //   dateOfDeath: "",
  //   beneficiaryAddress: "456 Example Road",
  //   beneficiaryPostalCode: "654321",
  //   beneficiaryUnitNumber: "02-03",
  // });

  // to make sure that all the input fields are proper
  const lookupFields = { // must validate if the field exists too!!
    mobileNumber: {
      formatter: (v) => v.replace(/\D/g, ""),
      minLength: 8,
      label: "Mobile Number"
    },
    nationalID: {
      formatter: (v) => v.toUpperCase(),
      minLength: 9, // or whatever
      label: "National ID"
    },
    email: {
      formatter: (v) => v.trim(),
      minLength: 5,
      label: "Email"
    }
  };

  // Fields that just need formatting (no lookup)
  const formatOnlyFields = {
    unitNumber: (v) => v.replace(/[^0-9-]/g, ""),
    postalCode: (v) => v.replace(/\D/g, "")
  };

  const [files, setFiles] = useState({
    birthCert: null,
    deathCert: null
  });

  const [errors, setErrors] = useState({
    bookingType: '',
    applicant: {},
    beneficiary: {}
  });

  // user session
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios.get("/api/user/me", { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(err => console.error("Failed to fetch session:", err));
  }, []);

  if (user === undefined) return null; 

  // when the new file is uploaded
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

  // handlers
  const handleApplicantChange = async (e) => {
    let { name, value } = e.target;

    // Run formatter if defined (for both lookup + format-only fields)
    if (lookupFields[name]?.formatter) { // for email, nric, mobile number
      value = lookupFields[name].formatter(value);
    } else if (formatOnlyFields[name]) { // for unit number, postal code
      value = formatOnlyFields[name](value);
    }

    // Always update applicant data immediately
    const nextApplicantData = { ...applicantData, [name]: value };
    setApplicantData(nextApplicantData);

    // Run validation for that field
    const singleFieldError = validateFormData(nextApplicantData, applicantRules, applicantFieldLabels)[name];
    setErrors((prevErrors) => ({
      ...prevErrors,
      applicant: {
        ...prevErrors.applicant,
        [name]: singleFieldError || ""
      }
    }));

    // Lookup check for specific fields
  if (user?.role === "staff" && lookupFields[name] && value.length >= lookupFields[name].minLength) {
      try {
        let tempName = "";
        if (name === "nationalID") tempName = "nric";
        else if (name === "mobileNumber") tempName = "contactNumber";
        else tempName = name;

        // 1. check for existing field
        const res = await axios.get(`/api/user/findExistingUser?attr=${tempName}&value=${encodeURIComponent(value)}`);
        const match = res.data;

        // 2. if found value
        if (Array.isArray(match) && match.length > 0) {
          console.log(`Existing record found for ${name}:`, match[0]);

          // 2a. update the value 
          setExistingUserData(match[0]);
          setShowExistingUserModal(true);

          setErrors((prev) => ({
            ...prev,
            applicant: {
              ...prev.applicant,
              [name]: `${lookupFields[name].label} exists`,
            },
          }));
        } 
        // 3. if cannot find existing value
        else {
          // 3a. reset all the values
          setExistingUserData(null);
          setShowExistingUserModal(false);

          setErrors((prev) => ({
            ...prev,
            applicant: {
              ...prev.applicant,
              [name]: "",
            },
          }));
        }
      } 
      // 4. try and catch values
      catch (err) { // have issues tryna find the existing value
        console.error(`Error checking existing ${name}:`, err);
      }
    }
  };


  const handleBeneficiaryChange = (e) => {
    let { name, value } = e.target;

    if (name === "beneficiaryPostalCode") {
      value = value.replace(/\D/g, "");
    }
    if (name === "beneficiaryUnitNumber") { // fix typo!
      value = value.replace(/[^0-9-]/g, "");
    }
    if (name === "beneficiaryNRIC") {
      value = value.toUpperCase();
    }

    const nextBeneficiaryData = { ...beneficiaryData, [name]: value };
    setBeneficiaryData(nextBeneficiaryData);

    const activeBeneficiaryRules = { ...beneficiaryRules };
    if (bookingType === "PreOrder") {
      delete activeBeneficiaryRules.dateOfDeath;
    }

    const allErrors = validateFormData(nextBeneficiaryData, activeBeneficiaryRules, beneficiaryFieldLabels);

    // Add DOB vs DOD check here:
    if (nextBeneficiaryData.dateOfBirth && nextBeneficiaryData.dateOfDeath) {
      // const dob = new Date(nextBeneficiaryData.dateOfBirth);
      // const dod = new Date(nextBeneficiaryData.dateOfDeath);

      if (beneficiaryData.dateOfDeath < beneficiaryData.dateOfBirth) {
        allErrors.dateOfDeath = "Date of Death cannot be before Date of Birth";
      }
    }

    const singleFieldError = allErrors[name];

    setErrors((prevErrors) => ({
      ...prevErrors,
      beneficiary: {
        ...prevErrors.beneficiary,
        [name]: singleFieldError || ""
      }
    }));
  
  };

  const onLoadExistingUser = (user) => {
    const loadedData = {
      fullName: user.fullName,
      gender: user.gender,
      nationality: user.nationality,
      nationalID: user.nric,
      mobileNumber: user.contactNumber,
      email: user.email,
      address: user.userAddress?.split(",")[0] || "",
      postalCode: user.userAddress?.split(", ")[2] || "",
      unitNumber: user.userAddress?.split(", ")[1] || "",
      dob: user.dob?.split("T")[0] || ""
    };

    setApplicantData(loadedData);

    toast.success("User data loaded into form.");
  };



  // Step completion status
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
    // Dynamically adjust rules based on bookingType
    const activeBeneficiaryRules = { ...beneficiaryRules };

    if (bookingType === "PreOrder") {
      delete activeBeneficiaryRules.dateOfDeath;
    }


    // Validate fields
    const applicantErrors = validateFormData(applicantData, applicantRules, applicantFieldLabels);
    const beneficiaryErrors = validateFormData(beneficiaryData, activeBeneficiaryRules, beneficiaryFieldLabels);

    // Business rule: Death after Birth
    if (beneficiaryData.dateOfBirth && beneficiaryData.dateOfDeath) {
      // const dob = new Date(beneficiaryData.dateOfBirth);
      // const dod = new Date(beneficiaryData.dateOfDeath);

      if (beneficiaryData.dateOfDeath < beneficiaryData.dateOfBirth) {
        beneficiaryErrors.dateOfDeath = "Date of Death cannot be before Date of Birth";
      }
    }

    // Validate files
    if (!files.birthCert) {
      beneficiaryErrors.birthCertFile = `${beneficiaryFieldLabels.birthCertFile} is required`;
    }

    if (bookingType === "Current") {
      if (!files.deathCert) {
        beneficiaryErrors.deathCertFile = `${beneficiaryFieldLabels.deathCertFile} is required`;
      }
    }


    // Validate booking type
    let bookingTypeError = '';
    if (!bookingType) {
      bookingTypeError = 'Booking Type is required';
    }

    // If errors → stop
    if (!!bookingTypeError || Object.keys(applicantErrors).length > 0 || Object.keys(beneficiaryErrors).length > 0) {
      toast.error("Please correct the errors before proceeding.");

      if (Object.keys(applicantErrors).length > 0) {
        Object.values(applicantErrors).forEach((msg) => {
          toast.error(`Applicant: ${msg}`);
        });
      }

      if (Object.keys(beneficiaryErrors).length > 0) {
        Object.values(beneficiaryErrors).forEach((msg) => {
          toast.error(`Beneficiary: ${msg}`);
        });
      }

      setErrors({
        bookingType: bookingTypeError,
        applicant: applicantErrors,
        beneficiary: beneficiaryErrors
      });
      return;
    }

    // Build FormData
    const formData = new FormData();

    Object.entries(applicantData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Beneficiary (map NRIC to beneficiaryNationalID)
    Object.entries(beneficiaryData).forEach(([key, value]) => {
      if (key === "beneficiaryNRIC") {
        formData.append("beneficiaryNationalID", value);
      } else {
        formData.append(key, value);
      }
    });

    formData.append("bookingType", bookingType);
    formData.append("nicheID", selectedSlot.nicheID);

    formData.append("birthCertFile", files.birthCert);
    formData.append("deathCertFile", files.deathCert);

    formData.append("userRole", user?.role); // e.g., "user", "staff", "admin"

    //console.log("going to payment !!");
    /*for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }*/

    onSubmit(formData, applicantData);
  };

  return (
    <div className="booking-form card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>New Application</h4>
        <Button variant="outline-danger" onClick={onCancel} aria-label="Cancel Booking Form">Go Back</Button>
      </div>

      <h6>Slot ID: {selectedSlot.nicheCode}</h6>

      <Form onSubmit={handleSubmit}>
        <Accordion defaultActiveKey="0" className="mb-3">

          {/* booking type */}
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

                {/* Dynamic explanation */}
                {bookingType === "Current" && (
                  <div className="alert alert-info mt-2">
                    <strong>Current Use:</strong> For immediate use. Upload both birth and death certificates. Niche will be booked and processed for placement.
                  </div>
                )}

                {bookingType === "PreOrder" && (
                  <div className="alert alert-info mt-2">
                    <strong>Pre-Order:</strong> For future use. Upload birth certificate only. Death certificate can be added later when applicable.
                  </div>
                )}
                {errors.bookingType && (
                  <div className="invalid-feedback d-block">
                    {errors.bookingType}
                  </div>
                )}
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
          
          {/* applicant details */}
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
                width={width}
                setApplicantData={setApplicantData}
                onLoadExistingUser={onLoadExistingUser}
                existingUserData={existingUserData}
                setShowExistingUserModal={setShowExistingUserModal}
                showExistingUserModal={showExistingUserModal}
              />
            </Accordion.Body>
          </Accordion.Item>
          
          {/* beneficiary details */}
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
                bookingType={bookingType}
                width={width}
              />

              {/* if staff, redirect to payment page */}
              {(user?.role === "staff" || user?.role === "admin") && (
                <Button
                  type="submit"
                  variant="success"
                  aria-label="Confirm Booking and Submit Form"
                  className="mt-4"
                >
                  Confirm Booking
                </Button>
              )}

              {/* if user, proceed to payment. */}
              {user?.role === "user" && (
                <Button
                  type="submit"
                  variant="success"
                  aria-label="Confirm Booking and Make Payment"
                  className="btn btn-elegant btn-md px-3 mt-2"
                >
                  Make Payment
                </Button>
              )}

            </Accordion.Body>
          </Accordion.Item>

        </Accordion>
      </Form>
    </div>
  );
}
