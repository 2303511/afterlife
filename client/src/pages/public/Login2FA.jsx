import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

export default function Login2FA() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        console.log("c - sending 2fa token for verifiation " , token );
        const response = await axios.post(
            '/api/auth/verify-login-2fa',
            { token },
            { withCredentials: true }
            );

        if (response.data.success) {
            // Get user info and complete login
            const res = await axios.get("/api/user/me", { withCredentials: true });
            const userData = { userID: res.data.userID, role: res.data.role };
            login(userData);

            // Redirect based on role
            if (res.data.role === "user") {
                navigate("/my-bookings");
            } else if (res.data.role === "staff") {
                navigate("/search-booking");
            } else if (res.data.role === "admin") {
                navigate("/admin-dashboard");
            }
        }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Two-Factor Authentication</h2>
      <p className="text-center mb-4">
        Please enter the 6-digit code from your authenticator app
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control text-center"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456"
            maxLength="6"
            required
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}