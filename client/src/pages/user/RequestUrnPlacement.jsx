import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

export default function RequestUrnPlacement() {
	// to get the current booking ID
	const [searchParams] = useSearchParams();
	const [bookingID] = useState(searchParams.get("bookingID"));
	const [currentBooking, setCurrentBooking] = useState(null);
	const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

	const [formData, setFormData] = useState({
		dateOfDeath: "",
		deathCertFile: null
	});

	// to handle errors
	const [errors, setErrors] = useState({});

	// to navigate pages after successful form submission
	const navigate = useNavigate();

	const fetchBooking = async (bookingID) => {
		try {
			let res = await axios.get("/api/booking/getBookingByBookingID", {
				params: { bookingID }
			});
			return res.data[0];
		} catch (err) {
			console.error("Failed to fetch booking: ", err);
			return null;
		}
	};

	const fetchBeneficiary = async (beneficiaryID) => {
		try {
			let res = await axios.get("/api/beneficiary/getBeneficiaryByID", {
				params: { beneficiaryID }
			});
			return res.data;
		} catch (err) {
			console.error("Failed to fetch booking: ", err);
			return null;
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			let currBooking = await fetchBooking(bookingID);
			if (currBooking != null) {
				setCurrentBooking(currBooking);
			}

			const res = await fetchBeneficiary(currBooking.beneficiaryID);
			if (res != null) {
				setBeneficiaryDetails(res);
			}
		};
		fetchData();
	}, [bookingID]);

	// handlers
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({ ...prev, deathCertFile: file }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newErrors = {};
		if (!formData.dateOfDeath) newErrors.dateOfDeath = "Date of death is required";
		if (!formData.deathCertFile) newErrors.deathCertFile = "Please upload a certificate";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const form = new FormData();
		if (currentBooking != null) form.append("beneficiaryID", currentBooking.beneficiaryID); // make sure currentBooking is set
		else toast.error("Problems retrieving booking details");

		form.append("nicheID", currentBooking.nicheID);
		form.append("bookingID", bookingID);
		form.append("dateOfDeath", formData.dateOfDeath);
		form.append("deathCertFile", formData.deathCertFile); // ✅ match `multer.single("deathCertFile")`

		try {
			await axios.post("/api/booking/place-urn", form, {
				headers: { "Content-Type": "multipart/form-data" },
				withCredentials: true // ✅ if your session uses cookies
			});
			toast.success("Urn placement request submitted!");
			navigate("/my-bookings");
		} catch (err) {
			toast.error("Something went wrong :(");
			console.error(err);
		}
	};

	return (
		<>
			{beneficiaryDetails && <h5 className="mt-4 mb-3">Urn Placement Details for {beneficiaryDetails.beneficiaryName}</h5>}

			<Form onSubmit={handleSubmit}>
				<Form.Group className="mb-3">
					<Form.Label>Date of Death</Form.Label>
					<Form.Control type="date" name="dateOfDeath" value={formData.dateOfDeath} onChange={handleChange} isInvalid={!!errors.dateOfDeath} max={new Date().toISOString().split("T")[0]} />
					<Form.Control.Feedback type="invalid">{errors.dateOfDeath}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Death Certificate</Form.Label>
					<Form.Control type="file" name="deathCertFile" onChange={handleFileChange} isInvalid={!!errors.deathCertFile} />
					<Form.Control.Feedback type="invalid">{errors.deathCertFile}</Form.Control.Feedback>
				</Form.Group>

				<Button type="submit">Submit Urn Placement Request</Button>
			</Form>
		</>
	);
}
