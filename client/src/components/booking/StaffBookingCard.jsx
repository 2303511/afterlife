import React from 'react';
import '../../styles/StaffBookingCard.css';

export default function StaffBookingCard({ booking, onApprove, onDecline, onArchive, currentTab }) {
    const {
        id,
        customerName,
        service,
        date,
        time,
        status,
        nicheCode,
        nicheStatus,
        beneficiaryName,
        paymentAmount,
        paymentMethod
    } = booking;

    return (
        <div className="booking-card card p-3 shadow-sm h-100">
            <h5 className="fw-bold mb-1">{customerName}</h5>
            <p className="text-muted mb-1">{service}</p>
            <p className="text-muted mb-2">{date} | {time}</p>

            <div className="info-group">
                <p><strong>Niche:</strong> {nicheCode || '—'}</p>
                <p><strong>Niche Status:</strong> {nicheStatus || '—'}</p>
                <p><strong>Beneficiary:</strong> {beneficiaryName || '—'}</p>
                <p><strong>Payment:</strong> ${paymentAmount || 0} ({paymentMethod || '—'})</p>
            </div>

            <div className="action-buttons mt-3">
                {nicheStatus === 'Pending' && currentTab === 'preorder' ? (
                    <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => onApprove(id)}>Approve Placement</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => onDecline(id)}>Decline</button>
                    </>
                ) : (
                    <>
                        <span className={`badge ${nicheStatus ? `status-${nicheStatus.toLowerCase()}` : 'status-unknown'}`}>
                            {nicheStatus || 'Unknown'}
                        </span>
                        {nicheStatus === 'Occupied' && currentTab !== 'archived' && (
                            <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => onArchive(id)}>
                                Archive & Free Niche
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
