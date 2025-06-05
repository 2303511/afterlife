import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function AddBlockModal({ show, onClose, onSave, newBlock, setNewBlock, buildings, levels, statusClass }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Block</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Building</Form.Label>
            <Form.Select
              value={newBlock.buildingId}
              onChange={(e) => setNewBlock({ ...newBlock, buildingId: e.target.value })}
            >
              <option value="">-- Select Building --</option>
              {buildings.map((b) => (
                <option key={b.buildingID} value={b.buildingID}>
                  {b.buildingName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Level</Form.Label>
            <Form.Select
              value={newBlock.levelId}
              onChange={(e) => setNewBlock({ ...newBlock, levelId: e.target.value })}
            >
              <option value="">-- Select Level --</option>
              {levels
                .filter((l) => l.buildingID === newBlock.buildingId)
                .map((l) => (
                  <option key={l.levelID} value={l.levelID}>
                    Level {l.levelNumber}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Block Notes</Form.Label>
            <Form.Control
              type="text"
              value={newBlock.notes}
              onChange={(e) => setNewBlock({ ...newBlock, notes: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rows (Max 8)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={8}
              value={newBlock.rows}
              onChange={(e) => setNewBlock({ ...newBlock, rows: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Columns (Max 10)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={10}
              value={newBlock.cols}
              onChange={(e) => setNewBlock({ ...newBlock, cols: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Initial Slot Status</Form.Label>
            <Form.Select
              value={newBlock.status}
              onChange={(e) => setNewBlock({ ...newBlock, status: e.target.value })}
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
        <Button variant="primary" onClick={onSave}>Create Block</Button>
      </Modal.Footer>
    </Modal>
  );
}
