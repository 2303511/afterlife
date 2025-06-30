import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

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
  selectedSlot,
  handleBook,
  isEdit = true,
  isBookButtonDisabled = false
}) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios.get("/api/user/me", { withCredentials: true })
    .then(res => {
      setUser(res.data);
    })
    .catch(err => console.error("Failed to fetch session:", err));
  }, []);

  if (user === undefined) return null;  

  const isStaff = user?.role === "staff";

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
            {blk.blockName}
          </option>
        ))}
      </Form.Select>

      {!isBookButtonDisabled && selectedSlot?.status === "available" && isStaff && (
        <Button variant="primary" onClick={handleBook}>
          Book This Niche
        </Button>
      )}

    </div>
  );
}
