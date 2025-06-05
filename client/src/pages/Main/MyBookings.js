import { useEffect, useState } from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min';

function MainContent({ userBookings, onViewPayment }) {
	if (!userBookings || !Array.isArray(userBookings)) {
		return (
			<div className="container mt-5">
				<h1 className="text-center mb-4">Loading...</h1>
			</div>
		);
	}

	return (
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
								<div className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#paymentModal" onClick={() => onViewPayment(booking)}>
									View Payment Receipt
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function MyBookings() {
	const [userID, setUserID] = useState(null);
	const [userBookings, setUserBookings] = useState(null);

	// for payment modal ???
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [paymentDetails, setPaymentDetails] = useState(null);

	useEffect(() => {
		const storedId = "dcd5af57-e5a9-4731-b7bd-26d231275c77";
		// const storedId = sessionStorage.getItem("userId");
		setUserID(storedId);

		fetch(`/api/bookings/getIndivBookings?userId=${storedId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				console.log("Bookings data:", data);
				setUserBookings(data);
			})
			.catch((error) => {
				console.error("Error fetching bookings:", error);
				setUserBookings([]);
			});
	}, [userID]);

	// get payment details by paymentID, depends on the selected booking
	const fetchPaymentDetails = async (paymentID) => {
		console.log("Fetching payment details for paymentId:", paymentID);
		try {
			const response = await fetch(`/api/payments/getPaymentById?paymentId=${paymentID}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" }
			});
			if (!response.ok) throw new Error("Payment fetch failed");

			const data = await response.json();
			console.log("Payment details fetched:", data);

			setPaymentDetails(data);

			console.log("Payment details set:", paymentDetails);
		} catch (error) {
			console.error("Failed to fetch payment:", error);
			setPaymentDetails(null);
		}
	};

    const fetchNicheDetails = async (nicheID) => {
        console.log("Fetching niche details for nicheID:", nicheID);
        try {
            const response = await fetch(`/api/niches/getNicheById?nicheId=${nicheID}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Niche fetch failed");

            const data = await response.json();
            console.log("Niche details fetched:", data);

            // Handle niche details as needed
        } catch (error) {
            console.error("Failed to fetch niche:", error);
        }
    }

    // Effect to handle modal close event and reset state
	useEffect(() => {
		const modal = document.getElementById("paymentModal");
		if (!modal) return;

		const handleModalClose = () => {
			setSelectedBooking(null);
			setPaymentDetails(null);
		};

		modal.addEventListener("hidden.bs.modal", handleModalClose);

		return () => {
			modal.removeEventListener("hidden.bs.modal", handleModalClose);
		};
	}, []);

	return (
		<>

			<MainContent
				userBookings={userBookings}
				onViewPayment={(booking) => {
					setSelectedBooking(booking);
					fetchPaymentDetails(booking.paymentID);
				}}
			/>

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

// claude prettify code
// import { useEffect, useState } from "react";

// // use custom theme styles
// import '../../styles/AfterLife-Theme.css';


// // Mock data for testing - replace with your real API
// const mockUserBookings = [
//   {
//     bookingID: "1",
//     nicheID: "N001",
//     bookingType: "Premium",
//     paymentID: "PAY001"
//   },
//   {
//     bookingID: "2", 
//     nicheID: "N002",
//     bookingType: "Standard",
//     paymentID: "PAY002"
//   },
//   {
//     bookingID: "3", 
//     nicheID: "N003",
//     bookingType: "Deluxe",
//     paymentID: "PAY003"
//   }
// ];

// const mockPaymentDetails = {
//   PAY001: {
//     paymentID: "PAY001",
//     amount: 299.99,
//     paymentMethod: "Credit Card",
//     paymentStatus: "Completed",
//     paymentDate: "2024-06-01"
//   },
//   PAY002: {
//     paymentID: "PAY002", 
//     amount: 199.99,
//     paymentMethod: "PayPal",
//     paymentStatus: "Completed",
//     paymentDate: "2024-06-02"
//   },
//   PAY003: {
//     paymentID: "PAY003", 
//     amount: 399.99,
//     paymentMethod: "Bank Transfer",
//     paymentStatus: "Pending",
//     paymentDate: "2024-06-03"
//   }
// };

// function MainContent({ userBookings, onViewPayment }) {
// 	if (!userBookings || !Array.isArray(userBookings)) {
// 		return (
// 			<div className="hero-gradient min-vh-100 d-flex align-items-center">
// 				<div className="container text-center">
// 					<div className="loading-spinner mx-auto mb-4"></div>
// 					<h2 className="text-dark">Loading your bookings...</h2>
// 					<p className="text-muted">Please wait while we retrieve your information</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="hero-gradient min-vh-100 py-5">
// 			<div className="container py-4">
// 				{/* Breadcrumb */}
// 				<nav aria-label="breadcrumb" className="mb-4">
// 					<ol className="breadcrumb bg-white rounded-pill px-4 py-3 shadow-sm">
// 						<li className="breadcrumb-item">
// 							<a href="#" className="text-decoration-none text-secondary">
// 								🏠 Home
// 							</a>
// 						</li>
// 						<li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
// 							📋 My Bookings
// 						</li>
// 					</ol>
// 				</nav>

// 				{/* Page Header */}
// 				<div className="text-center mb-5">
// 					<h1 className="display-4 fw-bold section-title text-dark mb-3">My Bookings</h1>
// 					<p className="text-muted lead">Manage and view your columbarium reservations</p>
// 				</div>

// 				{/* Bookings Cards */}
// 				<div className="row g-4">
// 					{userBookings.map((booking, index) => (
// 						<div key={booking.bookingID || index} className="col-lg-4 col-md-6">
// 							<div className="booking-card card h-100 border-0 shadow-lg card-hover">
// 								<div className="card-body p-4">
// 									<div className="d-flex justify-content-between align-items-start mb-3">
// 										<div className="booking-number">
// 											<span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">
// 												#{index + 1}
// 											</span>
// 										</div>
// 										<div className="booking-type">
// 											<span className={`badge rounded-pill px-3 py-2 ${
// 												booking.bookingType === 'Premium' ? 'bg-warning text-dark' :
// 												booking.bookingType === 'Deluxe' ? 'bg-success text-white' :
// 												'bg-primary text-white'
// 											}`}>
// 												{booking.bookingType}
// 											</span>
// 										</div>
// 									</div>

// 									<div className="booking-details mb-4">
// 										<div className="detail-item mb-3">
// 											<div className="d-flex align-items-center mb-2">
// 												<div className="icon-circle me-3">
// 													🏛️
// 												</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Niche Location</h6>
// 													<p className="mb-0 text-muted">{booking.nicheID}</p>
// 												</div>
// 											</div>
// 										</div>

// 										<div className="detail-item mb-3">
// 											<div className="d-flex align-items-center mb-2">
// 												<div className="icon-circle me-3">
// 													💳
// 												</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Payment ID</h6>
// 													<p className="mb-0 text-muted font-monospace">{booking.paymentID}</p>
// 												</div>
// 											</div>
// 										</div>
// 									</div>

// 									<button 
// 										className="btn btn-elegant w-100 rounded-pill"
// 										onClick={() => onViewPayment(booking)}
// 									>
// 										<span className="me-2">🧾</span>
// 										View Payment Receipt
// 									</button>
// 								</div>
// 							</div>
// 						</div>
// 					))}
// 				</div>

// 				{userBookings.length === 0 && (
// 					<div className="text-center py-5">
// 						<div className="empty-state">
// 							<div className="mb-4" style={{fontSize: '4rem'}}>📝</div>
// 							<h3 className="text-dark mb-3">No Bookings Found</h3>
// 							<p className="text-muted mb-4">You haven't made any bookings yet. Start by exploring our available niches.</p>
// 							<button className="btn btn-elegant rounded-pill px-4">
// 								Browse Available Niches
// 							</button>
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// }

// export default function MyBookings() {
// 	const [userID, setUserID] = useState(null);
// 	const [userBookings, setUserBookings] = useState(null);
// 	const [selectedBooking, setSelectedBooking] = useState(null);
// 	const [paymentDetails, setPaymentDetails] = useState(null);
// 	const [showModal, setShowModal] = useState(false);
// 	const [loadingPayment, setLoadingPayment] = useState(false);

// 	useEffect(() => {
// 		const storedId = "dcd5af57-e5a9-4731-b7bd-26d231275c77";
// 		setUserID(storedId);

// 		// Simulate API call with mock data
// 		setTimeout(() => {
// 			setUserBookings(mockUserBookings);
// 		}, 1000);

// 		// For real API, uncomment this:
// 		/*
// 		fetch(`/api/bookings/getIndivBookings?userId=${storedId}`, {
// 			method: "GET",
// 			headers: {
// 				"Content-Type": "application/json"
// 			}
// 		})
// 			.then((response) => {
// 				if (!response.ok) {
// 					throw new Error("Network response was not ok");
// 				}
// 				return response.json();
// 			})
// 			.then((data) => {
// 				console.log("Bookings data:", data);
// 				setUserBookings(data);
// 			})
// 			.catch((error) => {
// 				console.error("Error fetching bookings:", error);
// 				setUserBookings([]);
// 			});
// 		*/
// 	}, []);

// 	const fetchPaymentDetails = async (paymentId) => {
// 		console.log("Fetching payment details for paymentId:", paymentId);
// 		setLoadingPayment(true);
		
// 		try {
// 			// Simulate API call with mock data
// 			setTimeout(() => {
// 				const mockPayment = mockPaymentDetails[paymentId];
// 				if (mockPayment) {
// 					setPaymentDetails(mockPayment);
// 				} else {
// 					setPaymentDetails(null);
// 				}
// 				setLoadingPayment(false);
// 			}, 800);

// 			// For real API, uncomment this:
// 			/*
// 			const response = await fetch(`/api/payments/getPaymentById?paymentId=${paymentId}`, {
// 				method: "GET",
// 				headers: { "Content-Type": "application/json" }
// 			});
// 			if (!response.ok) throw new Error("Payment fetch failed");

// 			const data = await response.json();
// 			console.log("Payment details fetched:", data);
// 			setPaymentDetails(data);
// 			setLoadingPayment(false);
// 			*/
// 		} catch (error) {
// 			console.error("Failed to fetch payment:", error);
// 			setPaymentDetails(null);
// 			setLoadingPayment(false);
// 		}
// 	};

// 	const handleViewPayment = (booking) => {
// 		setSelectedBooking(booking);
// 		setShowModal(true);
// 		fetchPaymentDetails(booking.paymentID);
// 	};

// 	const handleCloseModal = () => {
// 		setShowModal(false);
// 		setSelectedBooking(null);
// 		setPaymentDetails(null);
// 		setLoadingPayment(false);
// 	};

// 	return (
// 		<>

// 			{/* Navigation placeholder */}
// 			<nav className="bg-white shadow-sm border-bottom">
// 				<div className="container py-3">
// 					<div className="d-flex align-items-center">
// 						<div className="me-3">
// 							<img 
// 								src="https://via.placeholder.com/40x40/6c757d/ffffff?text=AL" 
// 								alt="AfterLife logo" 
// 								className="rounded-circle" 
// 								style={{width: '40px', height: '40px'}}
// 							/>
// 						</div>
// 						<h5 className="fw-bold mb-0 text-dark">AfterLife</h5>
// 						<span className="ms-2 text-muted">Dignified Digital Remembrance</span>
// 					</div>
// 				</div>
// 			</nav>

// 			<MainContent
// 				userBookings={userBookings}
// 				onViewPayment={handleViewPayment}
// 			/>

// 			{/* Elegant Modal */}
// 			{showModal && (
// 				<div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={handleCloseModal}>
// 					<div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
// 						<div className="modal-content">
// 							<div className="modal-header">
// 								<h5 className="modal-title fw-bold text-dark">
// 									<span className="me-2">💳</span>
// 									Payment Receipt Details
// 								</h5>
// 								<button 
// 									type="button" 
// 									className="btn-close" 
// 									onClick={handleCloseModal}
// 									aria-label="Close"
// 								></button>
// 							</div>
// 							<div className="modal-body p-4">
// 								{loadingPayment ? (
// 									<div className="text-center py-5">
// 										<div className="loading-spinner mx-auto mb-4"></div>
// 										<p className="text-muted">Loading payment details...</p>
// 									</div>
// 								) : paymentDetails ? (
// 									<div>
// 										<div className="payment-detail-card">
// 											<div className="d-flex align-items-center mb-3">
// 												<div className="icon-circle me-3">🆔</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Payment ID</h6>
// 													<p className="mb-0 text-muted font-monospace">{paymentDetails.paymentID}</p>
// 												</div>
// 											</div>
// 										</div>

// 										<div className="payment-detail-card">
// 											<div className="d-flex align-items-center mb-3">
// 												<div className="icon-circle me-3">💰</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Amount</h6>
// 													<p className="mb-0 text-dark fw-bold fs-5">${paymentDetails.amount}</p>
// 												</div>
// 											</div>
// 										</div>

// 										<div className="payment-detail-card">
// 											<div className="d-flex align-items-center mb-3">
// 												<div className="icon-circle me-3">💳</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Payment Method</h6>
// 													<p className="mb-0 text-muted">{paymentDetails.paymentMethod}</p>
// 												</div>
// 											</div>
// 										</div>

// 										<div className="payment-detail-card">
// 											<div className="d-flex align-items-center justify-content-between mb-3">
// 												<div className="d-flex align-items-center">
// 													<div className="icon-circle me-3">✅</div>
// 													<div>
// 														<h6 className="mb-1 fw-semibold text-dark">Status</h6>
// 													</div>
// 												</div>
// 												<span className={`status-badge ${
// 													paymentDetails.paymentStatus === 'Completed' 
// 														? 'status-completed' 
// 														: 'status-pending'
// 												}`}>
// 													{paymentDetails.paymentStatus}
// 												</span>
// 											</div>
// 										</div>

// 										<div className="payment-detail-card">
// 											<div className="d-flex align-items-center mb-3">
// 												<div className="icon-circle me-3">📅</div>
// 												<div>
// 													<h6 className="mb-1 fw-semibold text-dark">Payment Date</h6>
// 													<p className="mb-0 text-muted">{paymentDetails.paymentDate}</p>
// 												</div>
// 											</div>
// 										</div>
// 									</div>
// 								) : (
// 									<div className="text-center py-5 text-muted">
// 										<div className="mb-3" style={{fontSize: '3rem'}}>❌</div>
// 										<h6>Failed to load payment details</h6>
// 										<p className="small">Please try again later</p>
// 									</div>
// 								)}
// 							</div>
// 							<div className="modal-footer bg-light border-0" style={{borderRadius: '0 0 20px 20px'}}>
// 								<button 
// 									type="button" 
// 									className="btn btn-elegant rounded-pill px-4"
// 									onClick={handleCloseModal}
// 								>
// 									Close Receipt
// 								</button>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// }