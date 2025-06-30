import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function EditSlotModal({
  show,
  onClose,
  onSave,
  selectedSlot,
  setSelectedSlot,
  statusClass
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    setIsConfirmed(false); // reset when modal opens
  }, [show]);

  const handleSave = () => {
    if (isConfirmed) {
      onSave();
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Manually Override Slot Status</Modal.Title>
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

            <Form.Group className="mb-3">
              <Form.Label>Reason for Override (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="E.g. user payment stuck, system failed to update"
                value={selectedSlot.overrideReason || ""}
                onChange={(e) =>
                  setSelectedSlot({
                    ...selectedSlot,
                    overrideReason: e.target.value
                  })
                }
              />
            </Form.Group>

            <div className="alert alert-warning mt-3">
              <strong>⚠ Manual Override Warning:</strong><br />
              Changing the status manually should <u>only</u> be done as a last resort.<br />
              Ensure there are no pending bookings or system issues before proceeding.
            </div>

            <Form.Check
              type="checkbox"
              id="confirmOverride"
              label="I understand and wish to proceed with the override"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-3"
            />
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleSave}
          disabled={!isConfirmed}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
