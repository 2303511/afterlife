import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    if (!token) {
      setError("Missing reset token.");
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      await axios.post("/api/auth/resetPassword", { token, newPassword: password });
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000); // redirect after 3 sec
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(err.response?.data?.error || "Failed to reset password.");
      setStatus("error");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2>Reset Your Password</h2>
          {status === "success" ? (
            <Alert variant="success">Password has been reset. Redirecting to login…</Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button
                variant="primary"
                type="submit"
                disabled={status === "submitting"}
                className="w-100"
              >
                {status === "submitting" ? "Resetting…" : "Reset Password"}
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}
