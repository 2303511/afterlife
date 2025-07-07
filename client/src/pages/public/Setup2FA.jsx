import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from 'qrcode.react';

export default function Setup2FA() {
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const generateSecret = async () => {
      try {
        console.log("Sending req to server to generate 2FA secret to display");
        const response = await axios.post("/api/auth/generate-2fa-secret", {}, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
        console.log("responsed data received secrect is " ,response.data.secret );
        console.log("responsed data received otpauthUrl is " ,response.data.otpauthUrl );
        setSecret(response.data.secret);
        setQrCodeUrl(response.data.otpauthUrl);
      } catch (err) {
        console.error("Failed to generate 2FA secret:", err);
        setError("Failed to setup 2FA. Please try again.");
      }
    };
    
    generateSecret();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        console.log("Sending the token to server to verify", token)
        const response = await axios.post("/api/auth/verify-2fa", { token }, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
            });

        if (response.data.success) {
            navigate("/login"); // Redirect to login after successful setup
        }
    } catch (err) {
        console.error("Failed to verify token:", err);
        setError("Invalid token. Please try again.");
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">Setup Two-Factor Authentication</h2>
      <div className="card p-4">
        <div className="text-center mb-4">
          <p>Scan this QR code with your authenticator app:</p>
          {qrCodeUrl && (
            <QRCodeSVG value={qrCodeUrl} size={200} className="mb-3"/>
          )}
          <p className="small text-muted">Or enter this secret manually: {secret}</p>
        </div>
        
        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label">Enter 6-digit code from your app</label>
            <input
              type="text"
              className="form-control"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456"
              required
              maxLength={6}
            />
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}