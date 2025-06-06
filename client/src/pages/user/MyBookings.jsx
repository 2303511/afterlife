import { useEffect, useState } from "react";
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";

export default function MyBookings() {
	const [userID, setUserID] = useState(null);
	const [userBookings, setUserBookings] = useState([]); // instead of []

	// for payment modal ???
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [nicheDetailsMap, setNicheDetailsMap] = useState({}); // key: bookingID

	const fetchBookingDetails = async (storedID) => {
		console.log("3. Fetching booking details for userID:", storedID);
		try {
			const response = await axios.get(`/api/booking/getIndivBooking`, {
				params: { userID: storedID },
				headers: {
					"Content-Type": "application/json"
				}
			});

			console.log("Booking details fetched:", response.data);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch booking:", error);
			return null;
		}
	};

	// get payment details by paymentID, depends on the selected booking
	const fetchPaymentDetails = async (paymentID) => {
		console.log("Fetching Payment Details with paymentID: ", paymentID);

		try {
			const response = await axios.get(`/api/payments/getPaymentByID`, {
				params: { paymentID: paymentID },
				headers: {
					"Content-Type": "application/json"
				}
			});

			console.log("Payment details fetched:", response.data);
			return response.data;
		} catch (e) {
			console.error("Failed to fetch Payment:", e);
			return null;
		}
	};

	const fetchNicheDetails = async (nicheID) => {
		console.log("Fetching niche details for nicheID:", nicheID);
		try {
			const response = await axios.get("/api/niche/getNicheByID", {
				params: { nicheID },
				headers: {
					"Content-Type": "application/json"
				}
			});

			console.log("Niche details fetched:", response.data);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch niche:", error);
			return null;
		}
	};

	const fetchBeneficiaryDetails = async (beneficiaryID) => {
		console.log("Fetching Beneficiary details for beneficiaryID", beneficiaryID);

		try {
			const response = await axios.get("/api/beneficiary/getBeneficiaryByID",  {
				params: { beneficiaryID },
				headers: {
					"Content-Type": "application/json"
				}
			});

			console.log("Beneficiary fetched:", response.data);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch beneficiary:", error);
			return null
		}

	}

	useEffect(() => {
		const storedID = "be4e4478-4251-47d2-b571-40d35308bc6a";
		setUserID(storedID);
		console.log(`1. userID stored!: ${userID}`);
	}, []);

	useEffect(() => {
		if (!userID) return; // Wait until userID is set

		console.log(`2. userID is now available: ${userID}, fetching booking...`);

		const init = async () => {
			const booking = await fetchBookingDetails(userID);
			console.log("Bookings fetched:", booking);
			setUserBookings(booking);
		};

		init();
	}, [userID]);

	useEffect(() => {
		if (!userBookings || !Array.isArray(userBookings)) return;

		const fetchAll = async () => {
			console.log("4. fetching all niche details");
			const nicheMap = {};

			for (const booking of userBookings) {
				const nicheDetail = await fetchNicheDetails(booking.nicheID);
				nicheMap[booking.bookingID] = nicheDetail;
			}

			console.log("All niche details fetched:", nicheMap);
			setNicheDetailsMap(nicheMap);
		};

		fetchAll();
	}, [userBookings]);

	// Effect to handle modal close event and reset state
	useEffect(() => {
		const modal = document.getElementById("paymentModal");
		if (!modal) return;

		const handleModalClose = () => {
			setPaymentDetails(null);
		};

		modal.addEventListener("hidden.bs.modal", handleModalClose);

		return () => {
			modal.removeEventListener("hidden.bs.modal", handleModalClose);
		};
	}, []);

	return (
		<>
			{!userBookings || !Array.isArray(userBookings) ? (
				<div className="container mt-5">
					<h1 className="text-center mb-4">Loading...</h1>
				</div>
			) : (
				<div className="container mt-5">
					{/* breadcrumb */}
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item">
								<a href="#">Home</a>
							</li>
							<li className="breadcrumb-item active" aria-current="page">
								My Bookings
							</li>
						</ol>
					</nav>

					<h1 className="mb-4">My Bookings</h1>

					<p>Now showing: <b>{userBookings.length} booking(s)</b></p>

					<div className="row">
						{userBookings.map((booking, index) => {
							const niche = nicheDetailsMap[booking.bookingID];

							if (!niche) return null; // Skip if niche details aren't loaded yet

							return (
								<div className="card col-3 m-3" key={booking.bookingID}>
									<div className="card-body">
										<h6 className="card-subtitle mb-2 text-body-secondary">
											Block {niche.blockID}, {niche.nicheColumn}-{niche.nicheRow}
										</h6>
										<h5 className="card-title">{niche.occupantName || "No name"}</h5>
										<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
										<a href="#" className="card-link">
											Card link
										</a>
										<a href="#" className="card-link">
											Another link
										</a>
									</div>
								</div>
							);
						})}
					</div>

					{/* details table */}
					<table className="table table-striped">
						<thead>
							<tr>
								<th>#</th>
								<th>nicheID</th>
								<th>bookingType</th>
								<th>paymentID</th>
							</tr>
						</thead>
						<tbody>
							{userBookings.map((booking, index) => (
								<tr key={booking.bookingID || index}>
									<th scope="row">{index + 1}</th>
									<td>{booking.nicheID}</td>
									<td>{booking.bookingType}</td>
									<td>
										<div
											className="btn btn-secondary"
											data-bs-toggle="modal"
											data-bs-target="#paymentModal"
											onClick={async () => {
												const paymentDetails = await fetchPaymentDetails(booking.paymentID);
												setPaymentDetails(paymentDetails);
											}}>
											View Payment Receipt
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			<div className="modal fade" id="paymentModal" tabIndex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="paymentModalLabel">
								Payment Details
							</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							{!paymentDetails ? (
								<p>Loading payment details...</p>
							) : (
								<>
									<p>
										<strong>Payment ID:</strong> {paymentDetails.paymentID}
									</p>
									<p>
										<strong>Amount:</strong> ${paymentDetails.amount}
									</p>
									<p>
										<strong>Method:</strong> {paymentDetails.paymentMethod}
									</p>
									<p>
										<strong>Status:</strong> {paymentDetails.paymentStatus}
									</p>
									<p>
										<strong>Date:</strong> {paymentDetails.paymentDate}
									</p>
								</>
							)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
