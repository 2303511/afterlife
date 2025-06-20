import { useNavigate } from 'react-router-dom';

export default function StaffBookingCard({ booking, onArchive, currentTab }) {
    const navigate = useNavigate();

    const {
        bookingID,
        customerName,
        service,
        date,
        time,
        nicheCode,
        nicheStatus,
        beneficiaryName,
        amount,
        paymentMethod
    } = booking;

    const handleViewDetails = () => {
        navigate(`/booking-approval/${bookingID}`);
    };

    return (
        <div className="booking-card card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">{customerName}</h5>
                    {nicheStatus === 'Pending' ? (
                        <span className="badge bg-warning text-dark">Pending</span>
                    ) : (
                        <span className={`badge ${nicheStatus ? `status-${nicheStatus.toLowerCase()}` : 'status-unknown'}`}>
                            {nicheStatus || 'Unknown'}
                        </span>
                    )}
                </div>

                <div className="info-group mb-3">
                    <p className="mb-1"><strong>Niche ID:</strong> {nicheCode || '—'}</p>
                    <p className="mb-1"><strong>Beneficiary:</strong> {beneficiaryName || <span className="text-muted fst-italic">Not assigned</span>}</p>
                    <p className="mb-1"><strong>Payment:</strong> ${amount || 0} {paymentMethod && <span className="badge bg-light text-dark border ms-2">{paymentMethod}</span>}</p>
                </div>
            </div>

            <div className="d-flex gap-2">
                {nicheStatus === 'Pending' ? (
                    <button className="btn btn-primary flex-grow-1" onClick={handleViewDetails}>
                        View Details
                    </button>
                ) : (
                    <>
                        {nicheStatus === 'Occupied' && currentTab !== 'archived' && (
                            <button className="btn btn-outline-danger flex-grow-1" onClick={() => onArchive(bookingID)}>
                                Archive & Free Niche
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
