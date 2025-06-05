import React from "react";
import { Form, Button } from "react-bootstrap";

export default function LocationSelector({
  buildings,
  levels,
  blocks,
  selectedBuilding,
  selectedLevel,
  selectedBlock,
  onBuildingChange,
  onLevelChange,
  onBlockChange,
  onAddClick
}) {
  return (
    <div className="d-flex gap-3 mb-3">
      <Form.Select value={selectedBuilding} onChange={onBuildingChange} style={{ width: "200px" }}>
        {buildings.map((b) => (
          <option key={b.buildingID} value={b.buildingID}>
            {b.buildingName}
          </option>
        ))}
      </Form.Select>

      <Form.Select value={selectedLevel} onChange={onLevelChange} style={{ width: "200px" }}>
        {levels.map((l) => (
          <option key={l.levelID} value={l.levelID}>
            Level {l.levelNumber}
          </option>
        ))}
      </Form.Select>

      <Form.Select value={selectedBlock} onChange={onBlockChange} style={{ width: "200px" }}>
        {blocks.map((blk) => (
          <option key={blk.blockID} value={blk.blockID}>
            Block {blk.levelNumber}
          </option>
        ))}
      </Form.Select>

      <Button onClick={onAddClick}>+ Add Slot</Button>
    </div>
  );
}
