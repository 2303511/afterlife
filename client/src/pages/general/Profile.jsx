import React, { useEffect, useState } from "react";
import axios from "axios";
import EditAccountModal from "./EditAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [sessionUser, setSessionUser] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get("/api/user/me", { withCredentials: true })
      .then(res => setSessionUser(res.data))
      .catch(err => console.error("Failed to fetch session:", err));
  }, []);

  const fetchProfile = async (id) => {
    try {
      const { data } = await axios.get("/api/user/getUserByID", {
        params: { userID: id },
        withCredentials: true,
      });
      setProfile(data);
    } catch (err) {
      console.error(`Failed to fetch profile for ${id}:`, err);
    }
  };

  /* initial profile load (runs once sessionUser is known) */
  useEffect(() => {
    if (sessionUser?.userID) fetchProfile(sessionUser.userID);
  }, [sessionUser]);

  if (sessionUser === undefined || profile === null) return null;

  const handleUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowModal(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* ────────── MAIN CONTENT ────────── */}
        <div className="col-lg-9">
          <h1 className="mb-4">My Profile</h1>

          <div className="card shadow-sm" style={{ maxWidth: 700 }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Account Information</h5>

              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold text-muted">Username</div>
                <div className="col-sm-8">{profile.username}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold text-muted">Full Name</div>
                <div className="col-sm-8">{profile.fullName}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold text-muted">Email</div>
                <div className="col-sm-8">{profile.email}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold text-muted">Phone</div>
                <div className="col-sm-8">{profile.contactNumber}</div>
              </div>

              <div className="row">
                <div className="col-sm-4 fw-semibold text-muted">Address</div>
                <div className="col-sm-8">{profile.userAddress}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ────────── SIDE NAV ────────── */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="position-sticky" style={{ top: 80 }}>
            <ul className="nav flex-column text-end">
              <li className="nav-item">
                <button className="btn btn-link p-0 mt-2" onClick={() => setShowModal(true)}>
                  Edit Account
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-link p-0 mt-2"
                  onClick={() => setShowPwModal(true)}
                >
                  Change Password
                </button>
              </li>
            </ul>
          </div>
        </div>
          {showModal && (
            <EditAccountModal
              show={showModal}
              profile={profile}
              onClose={() => setShowModal(false)}
              onUpdated={handleUpdated}
            />
          )}

          {showPwModal && (
            <ChangePasswordModal
              show={showPwModal}
              onClose={() => setShowPwModal(false)}
            />
          )}
      </div>
    </div>
  );
}
