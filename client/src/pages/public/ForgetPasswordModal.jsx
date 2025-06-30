// src/pages/ForgetPasswordModal.jsx

import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

export default function ForgetPasswordModal({ show, onHide }) {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      // You could generate a real reset link here or have the backend do it.
      const resetLink = `${window.location.origin}/reset-password?token=PLACEHOLDER`;
      await axios.post(
        "/api/email/sendResetPassword",
        { to: email, link: resetLink },
        { headers: { "Content-Type": "application/json" } }
      );
      setStatus("success");
    } catch (err) {
      console.error("Password reset request failed:", err);
      setErrorMessage("Failed to send reset link. Please try again.");
      setStatus("error");
    }
  };

  const resetForm = () => {
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reset Your Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {status === "success" ? (
          <Alert variant="success">
            If that email is registered, a reset link has been sent.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="resetEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === "sending"}
              />
            </Form.Group>
            {status === "error" && (
              <Alert variant="danger">{errorMessage}</Alert>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={status === "sending"}
              className="w-100"
            >
              {status === "sending" ? "Sending…" : "Send Reset Link"}
            </Button>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {status === "success" ? "Close" : "Cancel"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
