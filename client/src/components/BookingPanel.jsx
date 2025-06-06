import React from "react";
import { Offcanvas, Button, Form } from "react-bootstrap";

export default function BookingPanel({ show, onClose, selectedSlot }) {
  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Book This Niche</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {selectedSlot ? (
          <>
            <p><strong>Slot Code:</strong> {selectedSlot.niche_code}</p>
            <p><strong>Row:</strong> {selectedSlot.nicheRow}</p>
            <p><strong>Column:</strong> {selectedSlot.nicheColumn}</p>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Applicant Name</Form.Label>
                <Form.Control type="text" placeholder="Enter name" />
              </Form.Group>

              {/* Add more form fields as needed */}

              <Button variant="success" type="submit">
                Confirm Booking
              </Button>
            </Form>
          </>
        ) : (
          <p>No slot selected.</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
