// validationRules.js

// BOOKING FORM
export const applicantFieldLabels = {
    fullName: "Full Name",
    gender: "Gender",
    nationality: "Nationality",
    nationalID: "NRIC",
    mobileNumber: "Mobile Number",
    email: "Email",
    address: "Mailing Address",
    postalCode: "Postal Code",
    unitNumber: "Unit Number",
    dob: "Date of Birth",
    remarks: "Remarks"
  };
  
  export const applicantRules = {
    fullName: { required: true },
    gender: { required: true },
    nationality: { required: true },
    nationalID: {
      required: true,
      pattern: /^[STFG]\d{7}[A-Z]$/,
      message: "NRIC format invalid (eg: S1234567A)"
    },
    mobileNumber: {
      required: true,
      pattern: /^[89]\d{7}$/,
      message: "Mobile number must start with 8 or 9 and be 8 digits"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Simple email regex
      message: "Email format is invalid"
    },
    address: { required: true },
    postalCode: {
      required: true,
      pattern: /^\d{6}$/,
      message: "Postal code must be 6 digits"
    },
    unitNumber: { required: true },
    dob: { required: true },
    remarks: { required: false }
  };
  
  export const beneficiaryFieldLabels = {
    beneficiaryName: "Full Name",
    beneficiaryGender: "Gender",
    relationshipWithApplicant: "Relationship with Applicant",
    beneficiaryNationality: "Nationality",
    beneficiaryNRIC: "NRIC",
    dateOfBirth: "Date of Birth",
    dateOfDeath: "Date of Death",
    address: "Mailing Address",
    postalCode: "Postal Code",
    unitNumber: "Unit Number",
    birthCertFile: "Birth Certificate",
    deathCertFile: "Death Certificate",
  };
  
  export const beneficiaryRules = {
    beneficiaryName: { required: true },
    beneficiaryGender: { required: true },
    relationshipWithApplicant: { required: true },
    beneficiaryNationality: { required: true },
    beneficiaryNRIC: {
      required: true,
      pattern: /^[STFG]\d{7}[A-Z]$/,
      message: "NRIC format invalid (eg: S1234567A)"
    },
    dateOfBirth: { required: true },
    dateOfDeath: { required: true },
    beneficiaryAddress: { required: true },
    beneficiaryPostalCode: {
      required: true,
      pattern: /^\d{6}$/,
      message: "Postal code must be 6 digits"
    },
    beneficiaryUnitNumber: { required: true }
  };
  