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
    setIsConfirmed(false);
  }, [show]);

  const handleSave = () => {
    if (isConfirmed && selectedSlot.overrideReason?.trim()) {
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
            {/* Unified warning */}
            <div className="alert alert-warning mb-4">
              <strong>⚠ Manual Override Required:</strong><br />
              Use this feature only when necessary. A clear reason is required and will be logged for review.
            </div>

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

            <Form.Group className="mb-2">
              <Form.Label>
                Reason for Override <span className="text-danger">(required)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedSlot.overrideReason || ""}
                placeholder="E.g. user payment stuck, system failed to update"
                onChange={(e) =>
                  setSelectedSlot({
                    ...selectedSlot,
                    overrideReason: e.target.value
                  })
                }
              />
              <Form.Text className="text-muted">
                Please describe the reason clearly and accurately.
              </Form.Text>
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="confirmOverride"
              label="I understand and confirm this manual override"
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
          disabled={!isConfirmed || !selectedSlot.overrideReason?.trim()}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
