import { useEffect, useState } from "react";
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";

export default function MyBookings() {
	const [userID, setUserID] = useState(null);
	const [userBookings, setUserBookings] = useState(null); // instead of []

	// for payment modal ???
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [nicheDetailsMap, setNicheDetailsMap] = useState({}); // key: bookingID

	const fetchBookingDetails = async (storedId) => {
		console.log("3. Fetching booking details for userID:", storedId);
		try {
			const response = await axios.get(`/api/bookings/getIndivBookings`, {
				params: { userId: storedId },
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
				params: { paymentId: paymentID },
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
			const response = await axios.get("/api/niches/getNicheById", {
				params: { nicheId: nicheID },
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

	useEffect(() => {
		const storedID = "dcd5af57-e5a9-4731-b7bd-26d231275c77";
		setUserID(storedID);
		console.log(`1. userID stored!: ${userID}`);
	}, []);

	useEffect(() => {
		if (!userID) return; // Wait until userID is set

		console.log(`2. userID is now available: ${userID}, fetching bookings...`);

		const init = async () => {
			try {
				const response = await axios.get(`/api/bookings/getIndivBookings`, {
					params: { userId: userID },
					headers: {
						"Content-Type": "application/json"
					}
				});

				const bookings = response.data;
				console.log("Bookings fetched:", bookings);
				setUserBookings(bookings);
			} catch (err) {
				console.error("Error fetching bookings:", err);
			}
		};

		init();
	}, [userID]);

	useEffect(() => {
		if (!userBookings || !Array.isArray(userBookings)) return;

		const fetchAllNiches = async () => {
			console.log("4. fetching all niche details");
			const detailsMap = {};

			for (const booking of userBookings) {
				const data = await fetchNicheDetails(booking.nicheID);
				detailsMap[booking.bookingID] = data;
			}

			console.log("All niche details fetched:", detailsMap);
			setNicheDetailsMap(detailsMap);
		};

		fetchAllNiches();
	}, [userBookings]);

	// Effect to handle modal close event and reset state
	// useEffect(() => {
	// 	const modal = document.getElementById("paymentModal");
	// 	if (!modal) return;

	// 	const handleModalClose = () => {
	// 		setPaymentDetails(null);
	// 	};

	// 	modal.addEventListener("hidden.bs.modal", handleModalClose);

	// 	return () => {
	// 		modal.removeEventListener("hidden.bs.modal", handleModalClose);
	// 	};
	// }, []);

	return (
		<>
			{!userBookings || !Array.isArray(userBookings)} ? (
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

					{userBookings.map((booking, index) => (
						<div class="card col-3 m-3">
							<div class="card-body">
								<h6 class="card-subtitle mb-2 text-body-secondary">
									Block {nicheDetailsMap[booking.bookingID].nicheColumn}, {nicheDetailsMap[booking.bookingID].nicheColumn}-{nicheDetailsMap[booking.bookingID].nicheRow}
								</h6>
								<h5 class="card-title">{nicheDetailsMap[booking.bookingID].occupantName}</h5>
								<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
								<a href="#" class="card-link">
									Card link
								</a>
								<a href="#" class="card-link">
									Another link
								</a>
							</div>
						</div>
					))}

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
											onClick={() => {
												fetchPaymentDetails(booking.paymentID);
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
