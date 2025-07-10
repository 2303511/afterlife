import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EditAccountModal({ show, profile, onClose, onUpdated }) {
    const [form, setForm]   = useState(profile);  // editable copy
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // for api error

    const [errors, setErrors] = useState({}); // for validation error

    const validators = {
        username: (v) => !v?.trim()
          ? "Username is required"
          : v.length < 4
          ? "At least 4 characters"
          : !/^[a-zA-Z0-9_]+$/.test(v)
          ? "Only letters, numbers, and _"
          : "",
      
        fullName: (v) => !v?.trim()
          ? "Full name is required"
          : v.length < 2
          ? "At least 2 characters"
          : !/^[a-zA-Z\s]+$/.test(v)
          ? "Only letters and spaces"
          : "",
      
        email: (v) => !v?.trim()
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? "Invalid email"
          : "",
      
        contactNumber: (v) => !v?.trim()
          ? "Contact number required"
          : !/^\+?\d{8,15}$/.test(v)
          ? "Invalid contact number"
          : "",
      
        userAddress: (v) => !v?.trim()
          ? "Address required"
          : v.length < 5
          ? "Address must be at least 5 characters"
          : ""
      };
      
    const validateForm = () => {
        const newErrors = {};
        const fieldsToValidate = ["username", "fullName", "email", "contactNumber", "userAddress"];
        fieldsToValidate.forEach(key => {
            if (validators[key]) {
                newErrors[key] = validators[key](form[key]);
            }
        });
        setErrors(newErrors);
        return Object.values(newErrors).every(v => v === "");
    };

    useEffect(() => setForm(profile), [profile]);

    if (!show || !profile) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
    
        if (!validateForm()) {
            setLoading(false); // allows save changes button to be clicked again
            return;
        }
    
        try {
            const { username, fullName, email, contactNumber, userAddress } = form;
    
            await axios.post(
                "/api/user/edit_account",
                { username, fullName, email, contactNumber, userAddress },
                { withCredentials: true }
            );
    
            if (onUpdated) onUpdated(form);
            onClose();
        } catch (err) {
            console.error("Edit account failed:", err);
            setError(err.response?.data?.error || "Update failed");
        } finally {
            setLoading(false); 
        }
    };
    
    const stop = (e) => e.stopPropagation();

    return (
    <>
        <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }} />
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered" role="document" onClick={stop}>
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Edit Account</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
                {error && <div className="alert alert-danger py-1 mb-3">{error}</div>}

                <form>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    />
                    {errors.username && <div className="text-danger">{errors.username}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    />
                    {errors.fullName && <div className="text-danger">{errors.fullName}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                    type="tel"
                    className="form-control"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    />
                    {errors.contactNumber && <div className="text-danger">{errors.contactNumber}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                    type="text"
                    className="form-control"
                    name="userAddress"
                    value={form.userAddress}
                    onChange={handleChange}
                    />
                    {errors.userAddress && <div className="text-danger">{errors.userAddress}</div>}
                </div>
                </form>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                Save Changes
                </button>
            </div>
            </div>
        </div>
        </div>
    </>
    );
}
