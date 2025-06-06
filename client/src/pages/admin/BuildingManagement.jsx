// src/pages/BuildingManagement.js
import React, { useState } from "react";
import { Accordion, Form, Button } from "react-bootstrap";

export default function BuildingManagement() {
  const [buildingForm, setBuildingForm] = useState({ name: "", location: "" });
  const [levelForm, setLevelForm] = useState({ building: "", number: "", notes: "" });
  const [blockForm, setBlockForm] = useState({ level: "", notes: "" });

  const [buildings, setBuildings] = useState([]); // Local mock list
  const [levels, setLevels] = useState([]);

  const handleCreateBuilding = (e) => {
    e.preventDefault();
    const newBuilding = {
      id: Date.now().toString(),
      name: buildingForm.name,
      location: buildingForm.location,
    };
    setBuildings([...buildings, newBuilding]);
    setBuildingForm({ name: "", location: "" });
  };

  const handleCreateLevel = (e) => {
    e.preventDefault();
    const newLevel = {
      id: Date.now().toString(),
      buildingId: levelForm.building,
      number: levelForm.number,
      notes: levelForm.notes,
    };
    setLevels([...levels, newLevel]);
    setLevelForm({ building: "", number: "", notes: "" });
  };

  const handleCreateBlock = (e) => {
    e.preventDefault();
    const newBlock = {
      id: Date.now().toString(),
      levelId: blockForm.level,
      notes: blockForm.notes,
    };
    console.log("Block created:", newBlock); // Just for visual confirmation
    setBlockForm({ level: "", notes: "" });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Admin: Create Building, Level, and Block</h3>
      <Accordion defaultActiveKey="0">
        {/* Building */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Create Building</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleCreateBuilding}>
              <Form.Group className="mb-3">
                <Form.Label>Building Name</Form.Label>
                <Form.Control
                  type="text"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={buildingForm.location}
                  onChange={(e) => setBuildingForm({ ...buildingForm, location: e.target.value })}
                  required
                />
              </Form.Group>
              <Button type="submit">Add Building</Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Level */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Create Level</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleCreateLevel}>
              <Form.Group className="mb-3">
                <Form.Label>Select Building</Form.Label>
                <Form.Select
                  value={levelForm.building}
                  onChange={(e) => setLevelForm({ ...levelForm, building: e.target.value })}
                  required
                >
                  <option value="">-- Choose Building --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Level Number</Form.Label>
                <Form.Control
                  type="number"
                  value={levelForm.number}
                  onChange={(e) => setLevelForm({ ...levelForm, number: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  type="text"
                  value={levelForm.notes}
                  onChange={(e) => setLevelForm({ ...levelForm, notes: e.target.value })}
                />
              </Form.Group>
              <Button type="submit">Add Level</Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Block */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Create Block</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleCreateBlock}>
              <Form.Group className="mb-3">
                <Form.Label>Select Level</Form.Label>
                <Form.Select
                  value={blockForm.level}
                  onChange={(e) => setBlockForm({ ...blockForm, level: e.target.value })}
                  required
                >
                  <option value="">-- Choose Level --</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      Level {l.number} (Building ID: {l.buildingId})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  type="text"
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                />
              </Form.Group>
              <Button type="submit">Add Block</Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
  }
  