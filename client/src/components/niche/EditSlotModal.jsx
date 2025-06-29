import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function EditSlotModal({ show, onClose, onSave, selectedSlot, setSelectedSlot, statusClass }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Slot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedSlot && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Slot ID</Form.Label>
              <Form.Control type="text" value={selectedSlot.id} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedSlot.status}
                onChange={(e) =>
                  setSelectedSlot({ ...selectedSlot, status: e.target.value })
                }
              >
                {Object.keys(statusClass).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}
