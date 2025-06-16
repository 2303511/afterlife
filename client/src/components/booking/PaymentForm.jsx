import React, { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

export default function PaymentForm({ onSubmit, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod || !paymentAmount) {
      alert("Please enter both payment method and amount.");
      return;
    }

    onSubmit({
      method: paymentMethod,
      amount: paymentAmount
    });
  };

  return (
    <div className="payment-form card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Payment Details</h4>
        <Button variant="outline-secondary" onClick={onBack}>
          ← Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Select a method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="PayNow">PayNow</option>
                <option value="Waived">Waived</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Amount Paid (SGD)</Form.Label>
              <Form.Control
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant="success">
          Finalize Booking
        </Button>
      </Form>
    </div>
  );
}
