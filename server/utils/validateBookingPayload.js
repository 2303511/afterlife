function validateBookingPayload(payload, isPayment) {

    console.log(payload);
    const errors = {};

    // Applicant
    if (!payload.fullName) errors.fullName = "Full Name is required";
    if (!payload.gender) errors.gender = "Gender is required";
    if (!payload.nationality) errors.nationality = "Nationality is required";

    if (!/^[STFG]\d{7}[A-Z]$/.test(payload.nationalID)) {
        errors.nationalID = "Invalid NRIC format (S1234567A)";
    }

    if (!/^[89]\d{7}$/.test(payload.mobileNumber)) {
        errors.mobileNumber = "Invalid mobile number (8 digits starting with 8 or 9)";
    }

    if (!payload.email) {
        errors.email = "Email is required";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            errors.email = "Invalid email format";
        }
    }

    if (!payload.address) errors.address = "Address is required";
    if (!/^\d{6}$/.test(payload.postalCode)) {
        errors.postalCode = "Invalid postal code (6 digits)";
    }

    if (!payload.unitNumber) errors.unitNumber = "Unit Number is required";
    if (!payload.dob) errors.dob = "Date of Birth is required";

    // Beneficiary
    if (!payload.beneficiaryName) errors.beneficiaryName = "Beneficiary Name is required";
    if (!payload.beneficiaryGender) errors.beneficiaryGender = "Beneficiary Gender is required";
    if (!payload.relationshipWithApplicant) errors.relationshipWithApplicant = "Relationship is required";
    if (!payload.beneficiaryNationality) errors.beneficiaryNationality = "Beneficiary Nationality is required";

    if (!/^[STFG]\d{7}[A-Z]$/.test(payload.beneficiaryNationalID)) {
        errors.beneficiaryNationalID = "Invalid Beneficiary NRIC format (S1234567A)";
    }

    if (!payload.dateOfBirth) errors.dateOfBirth = "Beneficiary Date of Birth is required";

    // Only validate Date of Death if Current booking
    if (payload.bookingType === "Current") {
        if (!payload.dateOfDeath) errors.dateOfDeath = "Beneficiary Date of Death is required";

        if (payload.dateOfBirth && payload.dateOfDeath) {
            const dob = new Date(payload.dateOfBirth);
            const dod = new Date(payload.dateOfDeath);

            if (dod < dob) {
                errors.dateOfDeath = "Date of Death cannot be before Date of Birth";
            }
        }
    }

    if (!payload.beneficiaryAddress) errors.beneficiaryAddress = "Address is required";
    if (!/^\d{6}$/.test(payload.beneficiaryPostalCode)) {
        errors.beneficiaryPostalCode = "Invalid postal code (6 digits)";
    }

    if (!payload.beneficiaryUnitNumber) errors.beneficiaryUnitNumber = "Unit Number is required";

    if (payload.bookingType === "Current" && !payload.deathCertificate) {
        errors.deathCertficate = "Death Certificate file is required";
    }

    // Always validate birth cert (temp removal)
    if (!payload.birthCertificate) errors.birthCertficate = "Birth Certificate file is required";

    // Booking
    if (!payload.nicheID) errors.nicheID = "Niche ID is required";
    if (!payload.bookingType) errors.bookingType = "Booking Type is required";

    // Payment
    if (!isPayment) {
        if (!payload.paymentMethod) errors.paymentMethod = "Payment Method is required";

        if (!payload.paymentAmount || isNaN(payload.paymentAmount)) {
            errors.paymentAmount = "Valid Payment Amount is required";
        }
    }

    //if (!payload.paidByID) errors.paidByID = "Paid By ID is required";

    return errors;
}

module.exports = validateBookingPayload;