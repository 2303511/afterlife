import { useState } from "react";
import axios from "axios";

export default function ForgetPasswordModal({ show, onClose }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);  // null | "ok" | "error"
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");  

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await axios.post("/api/user/forget_password", { email });
            setStatus("ok");
        } catch (err) {
            setStatus("error");
            if (err.response?.status === 401) {
				setError("If that e-mail is registered, a reset link has been sent.");
			} else {
				setError("Something went wrong. Please try again.");
			}
        } finally {
            setSubmitting(false);
        }
    };

    // Bootstrap’s “modal fade” needs .show class + inline style to display
    const modalClass = `modal fade ${show ? "show" : ""}`;
    const modalStyle = show ? { display: "block" } : {};

    return (
    <div className={modalClass} style={modalStyle} tabIndex="-1" role="dialog" onClick={onClose}>
        <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Forget Password</h5>
                <button type="button" className="close" onClick={onClose}>
                    <span>&times;</span>
                </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p>Enter the e-mail address linked to your account and we’ll send you a reset link.</p>

                        <div className="form-group">
                            <label htmlFor="reset-email">E-mail</label>
                            <input
                                id="reset-email"
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={submitting || status === "ok"}
                            />
                        </div>

                        {status === "ok" && (
                        <div className="alert alert-success mt-3">
                            Check your inbox for the reset link.
                        </div>
                        )}
                        {status === "error" && (
                        <div className="alert alert-danger mt-3">
                            Something went wrong. Please try again.
                        </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="submit" className="btn btn-primary" disabled={!email || submitting || status === "ok"}>
                            {submitting ? "Sending…" : "Send Reset Link"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
}
