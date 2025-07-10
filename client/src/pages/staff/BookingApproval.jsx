import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BookingApproval() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    const { bookingID } = useParams();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('death'); // 'death' or 'birth'
    const [denialReason, setDenialReason] = useState('');


    useEffect(() => {
        axios.get(`/api/booking/approval/${bookingID}`, { withCredentials: true })
            .then(res => {
                // console.log("Booking fetched:", res.data);
                setBooking(res.data);
            })
            .catch(err => console.error("Failed to fetch booking:", err))
            .finally(() => setIsLoading(false));
    }, [bookingID]);

    const formatDate = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
    };

    if (isLoading) return <div className="p-4">Loading booking details...</div>;
    if (!booking) return <div className="p-4">Booking not found.</div>;

    const handleApprove = async () => {
        try {
            const res = await axios.post('/api/booking/approve', {
                bookingID: booking.bookingID,
                nicheID: booking.nicheID,
                bookingType: booking.bookingType
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success('Booking approved!');

                if (!booking.contactNumber) {
                    toast.error('Missing contact number — cannot redirect.');
                    return;
                }

                // Wait then redirect
                setTimeout(() => {
                    if (from) {
                        navigate(from);  // go back to the exact previous page
                    } else {
                        navigate('/search-booking');  // fallback
                    }
                }, 1500);
            } else {
                toast.error('Failed to approve booking.');
            }
        } catch (err) {
            console.error('Approve failed:', err);
            toast.error('Server error — could not approve booking.');
        }
    };

    const handleDeny = async () => {
        if (!denialReason.trim()) {
            toast.error("Please provide a reason for denial.");
            return;
        }

        try {
            const res = await axios.post('/api/email/sendDeniedRequest', {
                to: booking.email,
                fullName: booking.fullName,
                reason: denialReason
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Denial email sent.");

                setTimeout(() => {
                    if (from) {
                        navigate(from);
                    } else {
                        navigate('/search-booking');
                    }
                }, 1500);
            } else {
                toast.error("Email failed to send.");
              }
        } catch (err) {
            console.error("Email error:", err);
            toast.error("Failed to send email.");
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Pending Booking Approval</h2>

            <div className="row">
                {/* Left column: Booking Info + PDF viewer */}
                <div className="col-md-8 mb-3">
                    {/* Booking Info Card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Booking Information</h5>
                            <p><strong>Booking ID:</strong> {booking.bookingID}</p>
                            <p><strong>Booking Type:</strong> {booking.bookingType}</p>
                            <p><strong>Niche:</strong> {booking.nicheCode || '—'}</p>
                            <p><strong>Status:</strong> {booking.nicheStatus || '—'}</p>
                        </div>
                    </div>

                    {/* Payment Info Card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Payment Information</h5>
                            <p><strong>Payment ID:</strong> {booking.paymentID}</p>
                            <p><strong>Amount:</strong> ${booking.paymentAmount}</p>
                            <p><strong>Method:</strong> {booking.paymentMethod}</p>
                            <p><strong>Status:</strong> {booking.paymentStatus}</p>
                            <p><strong>Date:</strong> {booking.paymentDate}</p>
                        </div>
                    </div>

                    {/* Certificate Tabs */}
                    <div className="d-flex gap-4 mb-3 border-bottom">
                        <span
                            role="button"
                            className={`pb-2 ${activeTab === 'death' ? 'fw-bold border-bottom border-dark' : 'text-muted'}`}
                            onClick={() => setActiveTab('death')}
                        >
                            Death Certificate
                        </span>

                        <span
                            role="button"
                            className={`pb-2 ${activeTab === 'birth' ? 'fw-bold border-bottom border-dark' : 'text-muted'}`}
                            onClick={() => setActiveTab('birth')}
                        >
                            Birth Certificate
                        </span>
                    </div>



                    {/* PDF Viewer Placeholder */}
                    <div className="border rounded p-5 text-center bg-light">
                        {activeTab === 'death' ? (
                            booking.deathCertBase64 ? (
                                <iframe
                                    src={`data:${booking.deathCertMime};base64,${booking.deathCertBase64}`}
                                    title="Death Certificate"
                                    width="100%"
                                    height="600px"
                                    style={{ border: 'none' }}
                                    allowFullScreen
                                />
                            ) : (
                                <p className="text-muted">No Death Certificate Available</p>
                            )
                        ) : (
                            booking.birthCertBase64 ? (
                                <iframe
                                    src={`data:${booking.birthCertMime};base64,${booking.birthCertBase64}`}
                                    title="Birth Certificate"
                                    width="100%"
                                    height="600px"
                                    style={{ border: 'none' }}
                                    allowFullScreen
                                />
                            ) : (
                                <p className="text-muted">No Birth Certificate Available</p>
                            )
                        )}
                    </div>


                </div>

                {/* Right column: Beneficiary Info + Actions */}
                <div className="col-md-4">
                    {/* Beneficiary Card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Beneficiary Details</h5>
                            <p><strong>Name:</strong> {booking.beneficiaryName || <span className="text-muted fst-italic">Not assigned</span>}</p>
                            <p><strong>Date of Birth:</strong>
                                {booking.dateOfBirth ? formatDate(booking.dateOfBirth) : <span className="text-muted fst-italic">Not assigned</span>}
                            </p>

                            <p><strong>Date of Death:</strong>
                                {booking.dateOfDeath ? formatDate(booking.dateOfDeath) : <span className="text-muted fst-italic">Not assigned</span>}
                            </p>

                            <p><strong>Relationship:</strong> {booking.relationshipWithApplicant || <span className="text-muted fst-italic">Not assigned</span>}</p>
                        </div>
                    </div>

                    {/* Approve button */}
                    <button className="btn btn-success w-100 mb-3" onClick={handleApprove}>Approve Request</button>

                    {/* Deny form */}
                    <textarea
                        className="form-control mb-2"
                        placeholder="Reason..."
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                    ></textarea>

                    <button className="btn btn-danger w-100" onClick={handleDeny}>
                        Submit Denial
                    </button>

                </div>
            </div>
        </div>
    );
}
