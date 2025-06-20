import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BookingApproval() {
    const { bookingID } = useParams();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8888/api/booking/approval/${bookingID}`)
            .then(res => {
                console.log("Booking fetched:", res.data);
                setBooking(res.data);
            })
            .catch(err => console.error("Failed to fetch booking:", err))
            .finally(() => setIsLoading(false));
    }, [bookingID]);

    if (isLoading) return <div className="p-4">Loading booking details...</div>;
    if (!booking) return <div className="p-4">Booking not found.</div>;

    const formatDate = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
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

                    <div className="mb-2 d-flex gap-2">
                        {booking.deathCertificate ? (
                            <a target="_blank" className="btn btn-dark"> {/* href={getCertUrl(booking.deathCertificate)} */}
                                View Death Certificate
                            </a>
                        ) : (
                            <a className="btn btn-dark disabled" tabIndex="-1" aria-disabled="true">
                                No Death Certificate
                            </a>
                        )}

                        {booking.birthCertificate ? (
                            <a target="_blank" className="btn btn-outline-dark"> {/* href={getCertUrl(booking.birthCertificate)}*/}
                                View Birth Certificate
                            </a>
                        ) : (
                            <a className="btn btn-outline-dark disabled" tabIndex="-1" aria-disabled="true">
                                No Birth Certificate
                            </a>
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
                            <p><strong>Inscription:</strong> {booking.inscription || <span className="text-muted fst-italic">Not assigned</span>}</p>
                        </div>
                    </div>

                    {/* Approve button */}
                    <button className="btn btn-success w-100 mb-3">Approve Request</button>

                    {/* Deny form */}
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title mb-2">Deny Request</h6>
                            <textarea className="form-control mb-2" placeholder="Reason..."></textarea>
                            <button className="btn btn-danger w-100">Submit Denial</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
