/* eslint-disable */

import { useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

import { nationalities } from "../../config/nationalities.js";
import axios from "axios";
import { retrieveSession } from "../../utils/retrieveSession.js";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ApplicantDetails({ formData, onChange, errors, width = 600, setApplicantData, onLoadExistingUser, existingUserData, setShowExistingUserModal, showExistingUserModal }) {
	// if its for staff, width is bigger so it can accomodate to old width
	// if its for user bookings, width is smaller so need to resize.
	const isLargeScreen = width > 500 ? true : false;
	const [showModal, setShowModal] = useState(false); // do not preload the data yet
	const [fieldDisabled, setFieldDisabled] = useState(false);

	// for load user by NRIC modal
	const [nricInput, setNricInput] = useState("");
	const [userPreview, setUserPreview] = useState(null);
	const [loading, setLoading] = useState(false);

	// user session
	const [user, setUser] = useState(null);

	const mapUserToApplicant = (user) => {
		const [address = "", unitNumber = "", postalCode = ""] = user.userAddress.split(", ");

		return {
			fullName: user.fullName || "",
			email: user.email || "",
			gender: user.gender || "",
			nationality: user.nationality || "",
			nationalID: user.nric || "", // ← mapping nric to nationalID
			mobileNumber: user.contactNumber || "",
			address: address || "",
			postalCode: postalCode || "", // not present in user object
			unitNumber: unitNumber || "", // not present in user object
			dob: user.dob ? user.dob.split("T")[0] : "" // format to YYYY-MM-DD
		};
	};

	// if the current user is a user, auto load the details in
	useEffect(() => {
		const init = async () => {
			let currSession = await retrieveSession();

			if (!!currSession) setUser(currSession);
			else {
				toast.error(`Failed to find user in session`);
				return null;
			}

			if (currSession?.role === "user") {
				const userID = currSession?.userID;
				const fetchUserDetails = async () => await handleLoadDetails(userID);
				fetchUserDetails();
				setFieldDisabled(true); // ← you meant to set this to true, to disable editing
			}
		};
		init();
	}, []);

	useEffect(() => {
		if (showExistingUserModal && existingUserData) setFieldDisabled(true);
	}, [showExistingUserModal, existingUserData]);

	// handlers
	// search by NRIC
	const handleSearchNRIC = async () => {
		if (!nricInput) return toast.error("Please enter a valid NRIC");

		setLoading(true); // start loading
		setUserPreview(null); // reset user preview state

		try {
			const res = await axios.post("/api/user/getUserByNRIC", { nric: nricInput });

			if (res.data) {
				setUserPreview(res.data);
			} else {
				toast.error("No user found with this NRIC.");
			}
		} catch (err) {
			const msg = err.response?.data?.message || err.error || "Something went wrong while searching NRIC.";
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const confirmLoadUser = () => {
		const mapped = mapUserToApplicant(userPreview);
		setApplicantData(mapped);
		setShowModal(false);
		setFieldDisabled(true);
		toast.success("User data loaded.");
	};

	// handler for staff side, to render a uneditable text field
	const handleLoadDetails = async (userID) => {
		if (!userID) toast.error("Please enter a valid userID");

		try {
			const res = await axios.get(`/api/user/getUserByID?userID=${userID}`);
			let userDetails = mapUserToApplicant(res.data);

			if (!!res.data) {
				setApplicantData(userDetails);
				// toast.info(`Successfully loaded details for User with UserID ${userID}`);
				// onChange(userDetails); // update the form data
			} else {
				// toast.error(`Error retrieving data for User with UserID ${userID}`);
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

				{user?.role === "staff" && <Button onClick={() => setShowModal(true)}>Load My Details</Button>}
			</div>

			<Row>
				<Col sm={12} md={isLargeScreen ? 8 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>Full Name</Form.Label>
						<Form.Control name="fullName" value={formData.fullName} onChange={onChange} isInvalid={!!errors.fullName} readOnly={fieldDisabled} style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}} />
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
							readOnly={fieldDisabled}
							style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
						/>
						<Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group className="mb-3">
						<Form.Label>Nationality</Form.Label>
						<Form.Select name="nationality" value={formData.nationality} onChange={onChange} isInvalid={!!errors.nationality} disabled={fieldDisabled} style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}>
							<option value="">Select Nationality</option>
							{nationalities.map((nation) => (
								<option key={nation} value={nation}>
									{nation}
								</option>
							))}
						</Form.Select>

						{/* hidden field to pass for form processing */}
						{fieldDisabled && <input type="hidden" name="nationality" value={formData.nationality} />}
						<Form.Control.Feedback type="invalid">{errors.nationality}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>National ID (NRIC)</Form.Label>
						<Form.Control
							type="text"
							name="nationalID"
							value={formData.nationalID}
							onChange={onChange}
							isInvalid={!!errors.nationalID}
							readOnly={fieldDisabled}
							style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
						/>

						<Form.Control.Feedback type="invalid">{errors.nationalID}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Gender</Form.Label>
						<Form.Select name="gender" value={formData.gender} onChange={onChange} isInvalid={!!errors.gender} disabled={fieldDisabled} style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}>
							<option value="">Select Gender</option>
							<option>Male</option>
							<option>Female</option>
						</Form.Select>

						{/* hidden field to pass for form processing */}
						{fieldDisabled && <input type="hidden" name="nationality" value={formData.gender} />}

						<Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 4 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Mobile Number</Form.Label>
						<Form.Control
							type="text"
							name="mobileNumber"
							value={formData.mobileNumber}
							onChange={onChange}
							isInvalid={!!errors.mobileNumber}
							readOnly={fieldDisabled}
							style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
						/>

						<Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 6 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>Email Address</Form.Label>
						<Form.Control type="email" name="email" value={formData.email} onChange={onChange} isInvalid={!!errors.email} readOnly={fieldDisabled} style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}} />
						<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
					</Form.Group>
				</Col>


				<Col md={isLargeScreen ? 6 : 12}>
					<Form.Group className="mb-3">
						<Form.Label>Mailing Address</Form.Label>
						<Form.Control name="address" value={formData.address} onChange={onChange} isInvalid={!!errors.address} readOnly={fieldDisabled} style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}} />
						<Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 3 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Postal Code</Form.Label>
						<Form.Control
							type="text"
							name="postalCode"
							value={formData.postalCode}
							onChange={onChange}
							isInvalid={!!errors.postalCode}
							readOnly={fieldDisabled}
							style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
						/>

						<Form.Control.Feedback type="invalid">{errors.postalCode}</Form.Control.Feedback>
					</Form.Group>
				</Col>

				<Col md={isLargeScreen ? 3 : 6}>
					<Form.Group className="mb-3">
						<Form.Label>Unit Number</Form.Label>
						<Form.Control
							type="text"
							name="unitNumber"
							value={formData.unitNumber}
							onChange={onChange}
							isInvalid={!!errors.unitNumber}
							readOnly={fieldDisabled}
							style={fieldDisabled ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
						/>
						<Form.Control.Feedback type="invalid">{errors.unitNumber}</Form.Control.Feedback>
					</Form.Group>
				</Col>
			</Row>

			{/* modal to select user */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Load Applicant Details</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label>Enter Applicant's NRIC</Form.Label>
						<Form.Control type="text" value={nricInput} onChange={(e) => setNricInput(e.target.value)} placeholder="e.g. S1234567D" />
					</Form.Group>

					<Button variant="primary" onClick={handleSearchNRIC} disabled={loading}>
						{loading ? "Searching..." : "Search"}
					</Button>

					{userPreview && (
						<div className="mt-3">
							<strong>Full Name:</strong> {userPreview.fullName}
							<br />
							<strong>Contact:</strong> {userPreview.contactNumber}
							<br />
							<strong>Email:</strong> {userPreview.email}
							<br />
							<strong>Address:</strong> {userPreview.userAddress}
							<br />
							<strong>DOB:</strong> {userPreview.dob?.split("T")[0]}
						</div>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>
						Cancel
					</Button>

					<Button variant="success" onClick={confirmLoadUser} disabled={!userPreview}>
						Confirm Load
					</Button>
				</Modal.Footer>
			</Modal>

			{/* if there was an existing user data, load it up */}
			{existingUserData && user?.role === "staff" && showExistingUserModal && (
				<Modal show={showExistingUserModal} onHide={() => {
					setShowExistingUserModal(false);
					setFieldDisabled(false);
					
					}} centered>
					<Modal.Header closeButton>
						<Modal.Title>Existing User Found</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						{existingUserData ? (
						<>
							<p><strong>Name:</strong> {existingUserData.fullName}</p>
							<p><strong>Email:</strong> {existingUserData.email}</p>
							{/* add more fields as needed */}
						</>
						) : (
						<p>No user data available.</p>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => {
							setShowExistingUserModal(false);
							setFieldDisabled(false);
							
							}}>Cancel</Button>
						<Button
						variant="primary"
						onClick={() => {
							onLoadExistingUser(existingUserData);
							setShowExistingUserModal(false);
						}}
						>
							Load
						</Button>
					</Modal.Footer>
				</Modal>

			)}
		</>
	);
}
