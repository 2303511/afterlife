import { useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

import { nationalities } from "../nationalities.js";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ApplicantDetails({ formData, onChange, errors, width = 600, setApplicantData }) {
	// if its for staff, width is bigger so it can accomodate to old width
	// if its for user bookings, width is smaller so need to resize.
	const isLargeScreen = width > 500 ? true : false;
	const [showModal, setShowModal] = useState(false); // do not preload the data yet

	const mapUserToApplicant = (user) => {
		return {
			fullName: user.fullName || "",
			gender: user.gender || "",
			nationality: user.nationality || "",
			nationalID: user.nric || "", // ← mapping nric to nationalID
			mobileNumber: user.contactNumber || "",
			address: user.userAddress || "",
			postalCode: "", // not present in user object
			unitNumber: "", // not present in user object
			dob: user.dob ? user.dob.split("T")[0] : "" // format to YYYY-MM-DD
		};
	};

	// handlers
	const handleLoadDetails = async (userID) => {
		if (!userID) userID = sessionStorage.getItem("userId");

		try {
			const res = await axios.post("/api/user/getUserByID", { userID });
			let userDetails = mapUserToApplicant(res.data);

			if (!!res.data) {
				setApplicantData(userDetails);
        toast.info(`Successfully loaded details for User with UserID ${userID}`);
				// onChange(userDetails); // update the form data
			} 
      else {
				toast.error(`Error retrieving data for User with UserID ${userID}`);
			}

		} catch (err) {
			toast.error("Failed to load user data.");
			toast.error(err);
			console.error(err);
		}

		setShowModal(false); // close the modal
	};

	return (
		<>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">Applicant Details</h5>
        <Button onClick={() => handleLoadDetails()}>
          Load My Details
        </Button>
      </div>


			<Row>
				<Col sm={12} md={isLargeScreen ? 8 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>Full Name</Form.Label>
						<Form.Control name="fullName" value={formData.fullName} onChange={onChange} isInvalid={!!errors.fullName} />
						<Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col sm={12} md={isLargeScreen ? 4 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Date of Birth</Form.Label>
						<Form.Control
							type="date"
							name="dob"
							value={formData.dob}
							onChange={onChange}
							isInvalid={!!errors.dob}
							max={new Date().toISOString().split("T")[0]} // to make future dates unselectable
						/>
						<Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group className="mb-3">
						<Form.Label>Nationality</Form.Label>
						<Form.Select name="nationality" value={formData.nationality} onChange={onChange} isInvalid={!!errors.nationality}>
							<option value="">Select Nationality</option>
							{nationalities.map((nation) => (
								<option key={nation} value={nation}>
									{nation}
								</option>
							))}
						</Form.Select>
						<Form.Control.Feedback type="invalid">{errors.nationality}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>National ID (NRIC)</Form.Label>
						<Form.Control type="text" name="nationalID" value={formData.nationalID} onChange={onChange} isInvalid={!!errors.nationalID} />

						<Form.Control.Feedback type="invalid">{errors.nationalID}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Gender</Form.Label>
						<Form.Select name="gender" value={formData.gender} onChange={onChange} isInvalid={!!errors.gender}>
							<option value="">Select Gender</option>
							<option>Male</option>
							<option>Female</option>
						</Form.Select>
						<Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Mobile Number</Form.Label>
						<Form.Control type="text" name="mobileNumber" value={formData.mobileNumber} onChange={onChange} isInvalid={!!errors.mobileNumber} />

						<Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 6 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>Mailing Address</Form.Label>
						<Form.Control name="address" value={formData.address} onChange={onChange} isInvalid={!!errors.address} />
						<Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 3 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Postal Code</Form.Label>
						<Form.Control type="text" name="postalCode" value={formData.postalCode} onChange={onChange} isInvalid={!!errors.postalCode} />

						<Form.Control.Feedback type="invalid">{errors.postalCode}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 3 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Unit Number</Form.Label>
						<Form.Control type="text" name="unitNumber" value={formData.unitNumber} onChange={onChange} isInvalid={!!errors.unitNumber} />
						<Form.Control.Feedback type="invalid">{errors.unitNumber}</Form.Control.Feedback>
					</Form.Group>
				</Col>
			</Row>

			{/* modal to select user */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Load Your Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>This will autofill the form with details stored in your profile or session. Do you want to proceed?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleLoadDetails}>
						Yes, Load Details
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
