import React, { useState, useEffect } from "react";
import axios from "axios";

/* ───────────── Confirmation Modal ───────────── */
function ConfirmRoleChangeModal({ data, onClose, onConfirm }) {
    if (!data) return null;

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
                <h5 className="modal-title">Confirm Role Change</h5>
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                />
            </div>
            <div className="modal-body">
                <p>
                Are you sure you want to change user <strong>{data.username}</strong> (ID: <code>{data.userID}</code>) from <strong>{data.oldRole}</strong> to <strong>{data.newRole}</strong>?
                </p>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>
                Cancel
                </button>
                <button className="btn btn-primary" onClick={onConfirm}>
                Yes, change role
                </button>
            </div>
            </div>
        </div>
        </div>
    </>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedTab, setSelectedTab] = useState("all");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pendingRoles, setPendingRoles] = useState({});
    const [confirmData, setConfirmData] = useState(null);
    const [sessionUser, setSessionUser] = useState(undefined);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const { data } = await axios.get("/api/user/all_users", {
                withCredentials: true,
                });
                setUsers(data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        axios.get("/api/user/me", { withCredentials: true })
        .then(res => {
            setSessionUser(res.data);
        })
        .catch(err => console.error("Failed to fetch session:", err));
    }, []);

    if (sessionUser === undefined) return null;  
    const sessionUserID = sessionUser?.userID;  

    const saveRoleChange = async () => {
        if (!confirmData) return;
        try {
            await axios.post(
                "/api/user/update_role",
                { userID: confirmData.userID, role: confirmData.newRole },
                { withCredentials: true }
            );
            // update local list
            setUsers(p => p.map(u => u.userID === confirmData.userID ? { ...u, role: confirmData.newRole } : u));
            setPendingRoles(pr => {
                const c = { ...pr }; delete c[confirmData.userID]; return c;
            });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update role");
        } finally {
            setConfirmData(null);
        }
    };

    const handleSelectChange = (userID, newRole) => {
        setPendingRoles(prev => ({ ...prev, [userID]: newRole }));
    };

    const filteredUsers = users.filter((u) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "applicant") return u.role === "applicant";
        if (selectedTab === "staff") return u.role === "staff";
        if (selectedTab === "admin") return u.role === "admin";
        return false;
    });

    return (
        <div className="container py-4">
        <h1 className="mb-4">Manage User</h1>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
            <button
                className={`nav-link ${selectedTab === "all" ? "active" : ""}`}
                onClick={() => setSelectedTab("all")}
            >
                All Users
            </button>
            </li>
            <li className="nav-item">
            <button
                className={`nav-link ${selectedTab === "applicant" ? "active" : ""}`}
                onClick={() => setSelectedTab("applicant")}
            >
                Applicant
            </button>
            </li>
            <li className="nav-item">
            <button
                className={`nav-link ${selectedTab === "staff" ? "active" : ""}`}
                onClick={() => setSelectedTab("staff")}
            >
                Staff
            </button>
            </li>
            <li className="nav-item">
            <button
                className={`nav-link ${selectedTab === "admin" ? "active" : ""}`}
                onClick={() => setSelectedTab("admin")}
            >
                Admins
            </button>
            </li>
        </ul>

        {/* Table */}
        {loading ? (
            <div className="text-center py-5">
            <div className="spinner-border" />
            </div>
        ) : error ? (
            <div className="alert alert-danger">{error}</div>
        ) : (
            <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th style={{ width: 160 }}>Role</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((u) => {
                    const currentVal = pendingRoles[u.userID] ?? u.role;
                    const roleOptions = ["applicant", "staff", "admin"].filter((r) => r !== u.role);
                    const isSelf = (u.userID === sessionUserID);
                return (
                    <tr key={u.userID}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.contactNumber}</td>
                    <td>{u.userAddress}</td>
                    <td>
                        <select
                        className="form-select"
                        value={currentVal}
                        onChange={(e) => handleSelectChange(u.userID, e.target.value)}>
                            <option value={u.role}>{u.role}</option>
                            {roleOptions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </td>
                        <td style={{ width: 120 }}>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                disabled={isSelf}
                                onClick={() =>
                                    setConfirmData({
                                        userID: u.userID,
                                        username: u.fullName,
                                        oldRole: u.role,
                                        newRole: pendingRoles[u.userID],
                                    })
                                }>
                                Confirm Edit
                            </button>
                        </td>
                    </tr>
                    );
                })}
                {filteredUsers.length === 0 && (
                    <tr>
                    <td colSpan="5" className="text-center py-3">
                        No users in this category.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
            <ConfirmRoleChangeModal
                data={confirmData}
                onClose={() => setConfirmData(null)}
                onConfirm={saveRoleChange}
            />
        </div>
    );
}