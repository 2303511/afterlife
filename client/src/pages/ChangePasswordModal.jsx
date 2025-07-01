import React, { useState } from "react";
import axios from "axios";

export default function ChangePasswordModal({ show, onClose }) {
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!show) return null; // render nothing when hidden

    const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (newPw !== confirmPw) {
        setError("New passwords don’t match");
        return;
    }

    setLoading(true);

    try {
        await axios.post(
            "/api/user/change_password",
            { oldPassword: oldPw, newPassword: newPw },
            { withCredentials: true }
        );

        setSuccess("Password updated successfully!");
        setOldPw("");
        setNewPw("");
        setConfirmPw("");
        setLoading(false);

        setTimeout(onClose, 1500);
    } catch (err) {
        setError(err.response?.data?.error || "Failed to change password");
        setLoading(false);
    }
    };

    const stop = (e) => e.stopPropagation();

    return (
    <>
        <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
        />
        <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
        >
        <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={stop}
        >
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
                disabled={loading}
                />
            </div>

            <div className="modal-body">
                {error && (
                <div className="alert alert-danger py-1 mb-3">{error}</div>
                )}
                {success && (
                <div className="alert alert-success py-1 mb-3">{success}</div>
                )}

                <form>
                    <div className="mb-3">
                        <label className="form-label">Old Password</label>
                        <input
                        type="password"
                        className="form-control"
                        value={oldPw}
                        onChange={(e) => setOldPw(e.target.value)}
                        autoComplete="current-password"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                        type="password"
                        className="form-control"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        autoComplete="new-password"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                        type="password"
                        className="form-control"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        autoComplete="new-password"
                        />
                    </div>
                </form>
            </div>

            <div className="modal-footer">
                <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
                >
                Cancel
                </button>
                <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                >
                {loading && (
                    <span className="spinner-border spinner-border-sm me-2" />
                )}
                Save
                </button>
            </div>
            </div>
        </div>
        </div>
    </>
    );
}
