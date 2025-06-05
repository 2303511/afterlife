// src/pages/NicheMap.js
import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "../components/NicheGridSelector.css";
import axios from "axios";

const statusClass = {
  available: "status-available",
  selected: "status-selected",
  occupied: "status-occupied",
  reserved: "status-reserved",
  booked: "status-booked",
  blocked: "status-blocked",
  pending: "status-pending"
};

export default function NicheMap() {
  const [slots, setSlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ row: "", col: "", status: "available" });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8888/api/niche/buildings")
      .then((res) => {
        setBuildings(res.data);
        if (res.data.length > 0) {
          setSelectedBuilding(res.data[0].buildingID);
        }
      })
      .catch((err) => console.error("Error fetching buildings:", err));
  }, []);

  useEffect(() => {
    if (!selectedBuilding) return;
    axios.get(`http://localhost:8888/api/niche/levels/${selectedBuilding}`)
      .then((res) => {
        setLevels(res.data);
        if (res.data.length > 0) {
          setSelectedLevel(res.data[0].levelID);
        }
      })
      .catch((err) => console.error("Error fetching levels:", err));
  }, [selectedBuilding]);

  useEffect(() => {
    if (!selectedLevel) return;
    axios.get(`http://localhost:8888/api/niche/blocks/${selectedLevel}`)
      .then((res) => {
        setBlocks(res.data);
        if (res.data.length > 0) {
          setSelectedBlock(res.data[0].blockID);
        }
      })
      .catch((err) => console.error("Error fetching blocks:", err));
  }, [selectedLevel]);

  useEffect(() => {
    if (!selectedBlock) return;
    axios.get(`http://localhost:8888/api/niche/niches/${selectedBlock}`)
      .then((res) => {
        setSlots(res.data);
      })
      .catch((err) => console.error("Error fetching niches:", err));
  }, [selectedBlock]);

  const handleClick = (clickedSlot) => {
    if (!clickedSlot) return;
    setSelectedSlot(clickedSlot);
    setShowEditModal(true);
  };

  const handleAddSlot = () => {
    const newId = `A3-${newSlot.row}-${newSlot.col}`;
    const newSlotEntry = {
      id: newId,
      nicheRow: parseInt(newSlot.row),
      nicheColumn: parseInt(newSlot.col),
      status: newSlot.status,
    };
    setSlots((prev) => [...prev, newSlotEntry]);
    setShowAddModal(false);
    setNewSlot({ row: "", col: "", status: "available" });
  };

  return (
    <div className="container mt-4">
      <h1>Niche Map</h1>
      <h4>Booking Details</h4>

      <div className="d-flex gap-3 mb-3">
        <Form.Select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          style={{ width: "200px" }}
        >
          {buildings.map((b) => (
            <option key={b.buildingID} value={b.buildingID}>
              {b.buildingName}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{ width: "200px" }}
        >
          {levels.map((l) => (
            <option key={l.levelID} value={l.levelID}>
              Level {l.levelNumber}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={selectedBlock}
          onChange={(e) => setSelectedBlock(e.target.value)}
          style={{ width: "200px" }}
        >
          {blocks.map((blk) => (
            <option key={blk.blockID} value={blk.blockID}>
              Block {blk.levelNumber}
            </option>
          ))}
        </Form.Select>

        <Button onClick={() => setShowAddModal(true)}>+ Add Slot</Button>
      </div>

      <div className="d-flex justify-content-center flex-wrap mb-3 gap-3">
  {Object.entries(statusClass).map(([status, className]) => (
    <div className="d-flex align-items-center" key={status}>
      <div className={`legend-box ${className} me-2`} />
      <small className="text-capitalize">{status}</small>
    </div>
  ))}
</div>


      <div className="grid-wrapper">
        {[...Array(8)].map((_, row) => (
          <div className="d-flex" key={`row-${row}`}>
            {[...Array(10)].map((_, col) => {
              const slot = slots.find(
                (s) => s.nicheRow === row + 1 && s.nicheColumn === col + 1
              );
              const status = slot ? slot.status.toLowerCase() : "available";

              return (
                <div
                  key={`col-${col}`}
                  className={`slot-box ${statusClass[status]}`}
                  onClick={() => handleClick(slot)}
                  title={slot?.niche_code || `Row ${row + 1}, Col ${col + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSlot}>
            Add Slot
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSlots((prev) =>
                prev.map((slot) =>
                  slot.id === selectedSlot.id ? selectedSlot : slot
                )
              );
              setShowEditModal(false);
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}