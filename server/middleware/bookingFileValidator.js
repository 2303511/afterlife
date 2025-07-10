const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const { fileTypeFromBuffer } = require('file-type'); 

// File configuration constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
];

// Main booking schema validation
const joiValidatorRequirement = Joi.object({
    // Applicant - 10 fields on front end
    fullName: Joi.string().trim().required().max(100),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    nationality: Joi.string().trim().required().max(50),
    nationalID: Joi.string().trim().required().max(20),
    mobileNumber: Joi.string().trim().required().max(20),
    email: Joi.string().email().trim().required().max(100).email(),
    address: Joi.string().trim().required().max(200),
    postalCode: Joi.string().trim().required().max(10),
    unitNumber: Joi.string().trim().max(10).allow(''),
    dob: Joi.date().required().max('now'),

    // Beneficiary - 9 fields on front end
    beneficiaryName: Joi.string().trim().required().max(100),
    beneficiaryGender: Joi.string().valid('Male', 'Female', 'Other').required(),
    beneficiaryNationality: Joi.string().trim().required().max(50),
    beneficiaryNationalID: Joi.string().trim().required().max(20),
    beneficiaryAddress: Joi.string().trim().required().max(200),
    dateOfDeath: Joi.when('bookingType', {is: 'Current',then: Joi.date().required(),otherwise: Joi.any().empty('').valid(null)}),
    relationshipWithApplicant: Joi.string().trim().required().max(50),

    // Booking - 2 fields on front end
    nicheID: Joi.required(),
    bookingType: Joi.string().valid('Current', 'PreOrder').required(),

    // Meta - 2 fields on front end
    paidByID: Joi.required(),
    userRole: Joi.string().valid('Applicant', 'Admin', 'Staff','User', 'user','applicant','admin', 'staff').required()
}).options({ allowUnknown: true });

// File validation helper
const validateFile = async (file, fieldName) => {
    console.log("checking integrity of file , ", file);
    
    //check if file is there
    if (!file) {
        throw new Error(`${fieldName} is required`);
    }
    
    //check if file size too big - might be payload
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${fieldName} exceeds maximum size of ${MAX_FILE_SIZE/1024/1024}MB`);
    }
    
    /*  //check if the media type matches the allowed media type 
    only 3     'application/pdf',
    'image/jpeg',
    'image/png', */
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        //joining the accepted file type
        throw new Error(`${fieldName} must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }
    
    //check for bytes from the file buffer eg "real content"
    const detectedType = await fileTypeFromBuffer(file.buffer);
    // corrupted did not detect any file type 
    if (!detectedType) {
        throw new Error(`${fieldName} has an unsupported or corrupted file format.`);
    }

    //check if detected type matches the allow file types
    if (!ALLOWED_FILE_TYPES.includes(detectedType.mime)) {
        throw new Error(`${fieldName} must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }

    // count the number of . in file name
    const dotCount = (file.originalname.match(/\./g) || []).length;
    if (dotCount > 1) {
        throw new Error(`${fieldName} filename contains suspicious double extensions or dots. Please rename the file.`);
    }

    //cannot start with . also 
    //prevent file like .htaccess
    if (file.originalname.startsWith('.')) {
        throw new Error(`${fieldName} filename is not allowed to start with a dot.`);
    }

    console.log("no problem with the file,", file.originalname);

};

// Main middleware function
const validateFileBooking = async  (req, res, next) => {
    try {

        // Log all incoming fields for debugging
        console.log('=== REQUEST BODY FIELDS ===');
        console.log('Applicant Details:');
        console.log('- fullName:', req.body.fullName);
        console.log('- gender:', req.body.gender);
        console.log('- nationality:', req.body.nationality);
        console.log('- nationalID:', req.body.nationalID);
        console.log('- mobileNumber:', req.body.mobileNumber);
        console.log('- email:', req.body.email);
        console.log('- address:', req.body.address);
        console.log('- postalCode:', req.body.postalCode);
        console.log('- unitNumber:', req.body.unitNumber);
        console.log('- dob:', req.body.dob);

        console.log('\nBeneficiary Details:');
        console.log('- beneficiaryName:', req.body.beneficiaryName);
        console.log('- beneficiaryGender:', req.body.beneficiaryGender);
        console.log('- beneficiaryNationality:', req.body.beneficiaryNationality);
        console.log('- beneficiaryNationalID:', req.body.beneficiaryNationalID);
        console.log('- beneficiaryAddress:', req.body.beneficiaryAddress);
        console.log('- dateOfBirth:', req.body.dateOfBirth);
        console.log('- dateOfDeath:', req.body.dateOfDeath);
        console.log('- relationshipWithApplicant:', req.body.relationshipWithApplicant);

        console.log('\nBooking Details:');
        console.log('- nicheID:', req.body.nicheID);
        console.log('- bookingType:', req.body.bookingType);

        console.log('\nMeta Details:');
        console.log('- paidByID:', req.body.paidByID);
        console.log('- userRole:', req.body.userRole);

        // Validate body fields
        // will  not stop when it detects as error, will check thru the whole req.body
        // will farm all the errors first
        const { error } = joiValidatorRequirement.validate(req.body, { abortEarly: false });
        console.log("successful check thru the whole form");
        if (error) {
            const errors = error.details.map(detail => detail.message);
            /*  example of error mapped, maybe front end can display this
            {
                "errors": [
                  "\"fullName\" is required",
                  "\"email\" must be a valid email",
                  "\"dateOfDeath\" must be less than or equal to now"
                ]
            } */
            console.log("there is some issue with the form details");
            return res.status(400).json({ errors });
        }
        console.log("there is no issue with the form details, will check uploads file now");

        // Validate files 
        if (!req.files) {
            return res.status(400).json({ errors: ['No files were uploaded'] });
        }

        // Validate files - birth certificate always required
        if (!req.files?.['birthCertFile']?.[0]) {
            throw new Error('Birth certificate file is required');
        }
        await validateFile(req.files['birthCertFile'][0], 'Birth certificate');

        // Death certificate only required for Current bookings
        if (req.body.bookingType?.toLowerCase() === 'current') {
            if (!req.files?.['deathCertFile']?.[0]) {
                throw new Error('Death certificate file is required for Current bookings');
            }
            await validateFile(req.files['deathCertFile'][0], 'Death certificate');
        }

        next();
    } catch (err) {
        return res.status(400).json({ errors: [err.message] });
    }
};

module.exports = validateFileBooking;