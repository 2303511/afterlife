import { useEffect, useState, useContext } from "react";
import axios from "axios";

import CopyableField from "../../components/form/CopyableField";

// src/pages/MyPayments.js
export default function MyPayments() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { user } = useContext(require("../../auth/AuthContext").AuthContext);
	const userID   = user?.userID;
	
	// getter for all
	const fetchPaymentDetails = async (endpoint, idLabel, indivID) => {
		// console.log(`[Frontend] Fetching details for ${endpoint}:`, indivID);

		try {
			const response = await axios.get(`/api/${endpoint}`, {
				params: { [idLabel]: indivID },
				withCredentials: true,
				headers: {
					"Content-Type": "application/json"
				}
			});

			// console.log(`${endpoint} fetched:`, response.data);
			return response.data;
		} catch (error) {
			console.error(`[frontend] Failed to fetch ${endpoint}:`, error);
			return null;
		}
	};

	useEffect(() => {
		if (!userID) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				// Step 1: Bookings
				const bookings = await fetchPaymentDetails("booking/getBookingByUserID", "userID", userID);
				// console.log("Bookings fetched:", bookings);

				// Step 2: Payments
				const paymentList = await Promise.all(
					bookings.map(async (booking) => {
						const payment = await fetchPaymentDetails("payment/getPaymentByID", "paymentID", booking.paymentID);
						return payment;
					})
				);

				// console.log("Payments fetched:", paymentList);
				setPayments(paymentList);
				setError(null);
			} catch (err) {
				setError("Failed to load payments.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [userID]);

	return (
		<>
			<div className="container mt-5">
				{/* breadcrumb */}
				<nav aria-label="breadcrumb">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<a href="/">Home</a>
						</li>
						<li className="breadcrumb-item active" aria-current="page">
							My Payments
						</li>
					</ol>
				</nav>

				<div className="my-3">
					<h1 className="mb-0">My Payments</h1>
					<p className="page-subtitle">Manage and view all the payments made</p>
				</div>

				{/* loading */}
				{loading && (
					<div className="alert alert-info" role="alert">
						Loading payments...
					</div>
				)}

				{/* error */}
				{error && (
					<div className="alert alert-danger" role="alert">
						{error}
					</div>
				)}

				{/* payments table */}
				{!loading && !error && (
					<table className="table table-hover table-striped align-middle">
						<thead className="table-light">
							<tr>
								<th scope="col">Payment ID</th>
								<th scope="col"></th>
								<th scope="col">Amount</th>
								<th scope="col">Method</th>
								<th scope="col">Date</th>
							</tr>
						</thead>
						<tbody>
							{payments.map((payment, index) => (
								<tr key={payment.paymentID}>
									<td>
                    {payment.paymentID}
									</td>
                  <td><CopyableField value={payment.paymentID} /></td>
									<td>${Number(payment.amount).toFixed(2)}</td> {/* format for $$ */}
									<td>{payment.paymentMethod}</td>
									<td>{new Date(payment.paymentDate).toLocaleDateString()}</td> {/* format the right date format, DD/MM/YYYY */}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
}
