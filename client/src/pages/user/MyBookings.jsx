import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";
import CopyableField from "../../components/form/CopyableField";

// for error toasts
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { retrieveSession } from "../../utils/retrieveSession";

export default function MyBookings() {
	const navigate = useNavigate();

	const [userBookings, setUserBookings] = useState([]);

	const [paymentDetail, setPaymentDetail] = useState(null);
	const [bookingDetail, setBookingDetail] = useState(null);
	const [nicheDetail, setNicheDetail] = useState(null);
	const [beneficiaryDetail, setBeneficiaryDetail] = useState(null);

	const [nicheDetailsMap, setNicheDetailsMap] = useState({}); // key: booking.nicheID
	const [beneficiaryMap, setBeneficiaryMap] = useState({}); // key: booking.beneficiaryID
	const [blocksMap, setBlocksMap] = useState({}); // key: currNicheDetail.blockID

	// for UI filtering
	const [filteredBookings, setFilteredBookings] = useState([]);
	const [activeFilter, setActiveFilter] = useState("All");
	const [searchTerm, setSearchTerm] = useState("");

	// for user session 
	const [user, setUser] = useState(undefined);
	
	const bookingTypeCSS = {
		Current: "status-current",
		PreOrder: "status-preorder",
		Archived: "status-archived"
	};

	const bookingTypeIcons = {
		Current: "🏠",
		PreOrder: "📅",
		Archived: "📦"
	};

	const bookingStatusCSS = {
		Pending: "status-pending",
		Confirmed: "status-confirmed",
		Cancelled: "status-cancelled"
	};

	const bookingStatusIcons = {
		Pending: "⌛️",
		Confirmed: "✅", 
		Cancelled: "❌"
	};

	// getter for all
	const fetchDetails = async (endpoint, idLabel, indivID) => {
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

	// TO RETRIEVE SESSION
	useEffect(() => {
		const init = async () => {
			let currentUser = await retrieveSession();

			if (!!currentUser) setUser(currentUser)
			else {
				toast.error(`Failed to find user in session`);
				return null
			}
		}
		init();
	}, []);

	const userID = user?.userID;

	useEffect(() => {
		if (!userID) return; // Wait until userID is set

		// console.log(`2. userID is now available: ${userID}, fetching booking...`);

		const init = async () => {
			const booking = await fetchDetails("booking/getBookingByUserID", "userID", userID);
			// console.log("Bookings fetched:", booking);
			// console.log(`length of Bookings: ${booking.length}`);

			if (!booking || !Array.isArray(booking) || booking.length === 0) {
				// console.log("there are no bookings");
				return;
			};

			// console.log("3. fetching all niche details");
			const nicheMap = {};
			const beneficiaryMap = {};
			const blockMap = {};

			for (const b of booking) {
				const currNicheDetail = await fetchDetails("niche/getNicheByID", "nicheID", b.nicheID);
				nicheMap[b.nicheID] = currNicheDetail;

				const beneficiaryDetail = await fetchDetails("beneficiary/getBeneficiaryByID", "beneficiaryID", b.beneficiaryID);
				beneficiaryMap[b.beneficiaryID] = beneficiaryDetail;

				var currBlockDetail = await fetchDetails("block/getBlockByID", "blockID", currNicheDetail.blockID);
				blockMap[currNicheDetail.blockID] = currBlockDetail;
			}

			// console.log("All niche details fetched:", nicheMap);

			setUserBookings(booking);
			setNicheDetailsMap(nicheMap);
			setBeneficiaryMap(beneficiaryMap);
			setBlocksMap(blockMap);
		};

		init();
	}, [userID]);

	// claude filtered bookings
	useEffect(() => {
		let filtered = userBookings;

		if (activeFilter !== "All") {
			filtered = filtered.filter((booking) => booking.bookingStatus === activeFilter);
		}

		if (searchTerm) {
			filtered = filtered.filter((booking) => {
				const beneficiary = beneficiaryMap[booking.beneficiaryID];
				const niche = nicheDetailsMap[booking.nicheID];
				const searchLower = searchTerm.toLowerCase();

				return booking.bookingID.toLowerCase().includes(searchLower) || (beneficiary?.beneficiaryName || "").toLowerCase().includes(searchLower) || (niche?.blockID || "").toLowerCase().includes(searchLower);
			});
		}

		setFilteredBookings(filtered);
	}, [userBookings, activeFilter, searchTerm, beneficiaryMap, nicheDetailsMap]);


	// handlers
	const handleFilterClick = (filter) => {
		setActiveFilter(filter);
	};

	const handlePaymentDetails = async (paymentID) => {
		const currPaymentDetails = await fetchDetails("payment/getPaymentByID", "paymentID", paymentID);
		setPaymentDetail(currPaymentDetails);
	};

	const handleBookingDetails = async (bookingID) => {
		var currBookingDetails = await fetchDetails("booking/getBookingByBookingID", "bookingID", bookingID);
		if (!currBookingDetails) {
			toast.error("Failed to load booking details");
			return;
		}
		const currNicheDetail = await fetchDetails("niche/getNicheByID", "nicheID", currBookingDetails.nicheID);
		const currBeneficiaryDetail = await fetchDetails("beneficiary/getBeneficiaryByID", "beneficiaryID", currBookingDetails.beneficiaryID);

		setBookingDetail(currBookingDetails);
		setNicheDetail(currNicheDetail);
		setBeneficiaryDetail(currBeneficiaryDetail);
	};

	const closeModal = () => {
		setBookingDetail(null);
		setPaymentDetail(null);
	};

	if (!userBookings) {
		return (
			<div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
				<div className="container py-5">
					<div className="text-center">
						<div className="loading-spinner mx-auto mb-4"></div>
						<h2 className="loading-text">Loading your bookings...</h2>
					</div>
				</div>
			</div>
		);
	} else if (userBookings.length === 0) {
		return (
			<div className="container py-5">
				<div className="text-center">
					<h2 className="loading-text p-3">You have no bookings.</h2>
					<Link to="/book-niche">
						<button className="btn btn-elegant btn-lg rounded-pill px-4">📝 Make a Booking</button>
					</Link>
				</div>
			</div>
		);
	}

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
							My Bookings
						</li>
					</ol>
				</nav>

				<div className="my-3">
					<h1 className="mb-0">My Bookings</h1>
					<p className="page-subtitle">Manage and view all your memorial bookings</p>
				</div>

				{/* Enhanced Filter & Search Section */}
				<div className="filter-section mb-4">
					<div className="row align-items-center">
						<div className="col-md-6">
							<div className="filter-tabs">
								{["All", "Confirmed", "Pending", "Cancelled"].map((filter) => (
									<button key={filter} className={`filter-tab ${activeFilter === filter ? "active" : ""}`} onClick={() => handleFilterClick(filter)}>
										{bookingStatusIcons[filter] || "📄"} {filter}
									</button>
								))}
							</div>
						</div>
						<div className="col-md-6">
							<div className="search-container">
								<div className="search-input-wrapper">
									<span className="search-icon">🔍</span>
									<input type="text" className="search-input" placeholder="Search by Booking ID or Names" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Results Info */}
				<div className="results-info mb-4">
					<span className="results-text">
						Showing <strong>{filteredBookings.length}</strong> of <strong>{userBookings.length}</strong> bookings
						{activeFilter !== "All" && <span className="filter-indicator"> • Filtered by {activeFilter}</span>}
						{searchTerm && <span className="search-indicator"> • Searching "{searchTerm}"</span>}
					</span>
				</div>

				{/* Enhanced Bookings Grid */}
				<div className="bookings-grid">
					{filteredBookings.map((booking, index) => {
						const niche = nicheDetailsMap[booking.nicheID];
						const beneficiary = beneficiaryMap[booking.beneficiaryID];

						if (!niche) return null;

						return (
							<div className="booking-card" key={booking.bookingID}>
								<div className="booking-card-header">
									<div className={`status-badge ${bookingStatusCSS[booking.bookingStatus]}`}>
										<span className="status-icon">{bookingStatusIcons[booking.bookingStatus]}</span>
										{booking.bookingStatus}
									</div>
									<div className="booking-id px-2">#{booking.bookingID}</div>
									<CopyableField value={booking.bookingID} />
								</div>

								<div className="booking-card-body">
									<div className="location-info">
										<div className="location-icon">🏢</div>
										<div className="location-text">
											<strong>{blocksMap[niche.blockID].blockName}</strong>
											<span>
												{niche.nicheColumn}-{niche.nicheRow}
											</span>
										</div>
									</div>

									<div className="beneficiary-info d-flex align-items-center">
										{/* avatar on the left */}
										<div className="beneficiary-avatar me-2">{beneficiary?.beneficiaryName?.charAt(0) || "N"}</div>
										
										{/* details on the right */}
										<div className="beneficiary-details d-flex align-items-center w-100">
											<h3 className="beneficiary-name mb-0">{beneficiary?.beneficiaryName || "No name"}</h3>
											<div className={`status-badge ms-auto ${bookingTypeCSS[booking.bookingType]}`}>
												<span className="status-icon">{bookingTypeIcons[booking.bookingType]}</span>
												{booking.bookingType}
											</div>
										</div>
									</div>
								</div>

								<div className="booking-card-actions">
									<button className="action-btn primary" onClick={() => handleBookingDetails(booking.bookingID)}>
										<span className="btn-icon">🔍</span>
										View Details
									</button>
									<button className="action-btn secondary" onClick={() => handlePaymentDetails(booking.paymentID)}>
										<span className="btn-icon">🧾</span>
										Payment Info
									</button>
								</div>
							</div>
						);
					})}
				</div>

				{filteredBookings.length === 0 && (
					<div className="empty-state">
						<div className="empty-icon">🔍</div>
						<h3>No bookings found</h3>
						<p>Try adjusting your search or filter criteria</p>
					</div>
				)}

				{/* Enhanced Payment Modal */}
				{paymentDetail && (
					<div className="modal-overlay" onClick={closeModal}>
						<div className="modal-container" onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h2 className="modal-title">
									<span className="modal-icon">💳</span>
									Payment Details
								</h2>
								<button className="modal-close" onClick={closeModal}>
									×
								</button>
							</div>

							<div className="modal-body">
								<div className="payment-details-grid">
									<div className="modal-detail-item">
										<span className="detail-label">Payment ID</span>
										<div className="detail-value-with-copy">
											<span className="detail-value">{paymentDetail.paymentID}</span>
											<CopyableField value={paymentDetail.paymentID} />
										</div>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Amount</span>
										<span className="detail-value amount">${paymentDetail.amount}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Method</span>
										<span className="detail-value">{paymentDetail.paymentMethod}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Status</span>
										<span className={`detail-value status-${paymentDetail.paymentStatus.toLowerCase()}`}>{paymentDetail.paymentStatus}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Date</span>
										<span className="detail-value">{paymentDetail.paymentDate}</span>
									</div>
								</div>
							</div>

							<div className="modal-footer">
								<button className="modal-btn secondary" onClick={closeModal}>
									Close
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Enhanced Booking Modal */}
				{bookingDetail && nicheDetail && (
					<div className="modal-overlay" onClick={closeModal}>
						<div className="modal-container" onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h2 className="modal-title">
									<span className="modal-icon">📖</span>
									Booking Details
								</h2>
								<button className="modal-close" onClick={closeModal}>
									×
								</button>
							</div>

							<div className="modal-body">
								<div className="payment-details-grid">
									<div className="modal-detail-item">
										<span className="detail-label">Booking ID</span>
										<div className="detail-value-with-copy">
											<span className="detail-value">{bookingDetail.bookingID}</span>
											<CopyableField value={bookingDetail.bookingID} />
										</div>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Niche Location</span>
										<span className="detail-value">
											Column-Row: {nicheDetail.nicheColumn}-{nicheDetail.nicheRow}
										</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Beneficiary Name</span>
										<span className="detail-value">{beneficiaryDetail.beneficiaryName}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Booking Type</span>
										<span className={`detail-value status-${bookingDetail.bookingType.toLowerCase()}`}>{bookingDetail.bookingType}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Date of Birth</span>
										<span className="detail-value">{beneficiaryDetail.dateOfBirth}</span>
									</div>
									<div className="modal-detail-item">
										<span className="detail-label">Date of Death</span>
										<span className="detail-value">{beneficiaryDetail.dateOfDeath}</span>
									</div>
								</div>
							</div>

							<div className="modal-footer">
								{bookingDetail.bookingType === "PreOrder" && (
									<button className="modal-btn primary" onClick={() => navigate(`/req-urn-placement?bookingID=${bookingDetail.bookingID}`)}>
										Request Urn Placement
									</button>
								)}
								<button className="modal-btn secondary" onClick={closeModal}>
									Close
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
