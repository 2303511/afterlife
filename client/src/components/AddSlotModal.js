import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function AddSlotModal({ show, onClose, onSave, newSlot, setNewSlot, statusClass }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Slot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Row</Form.Label>
            <Form.Control
              type="number"
              value={newSlot.row}
              onChange={(e) => setNewSlot({ ...newSlot, row: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Column</Form.Label>
            <Form.Control
              type="number"
              value={newSlot.col}
              onChange={(e) => setNewSlot({ ...newSlot, col: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={newSlot.status}
              onChange={(e) => setNewSlot({ ...newSlot, status: e.target.value })}
            >
              {Object.keys(statusClass).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Add Slot</Button>
      </Modal.Footer>
    </Modal>
  );
}
