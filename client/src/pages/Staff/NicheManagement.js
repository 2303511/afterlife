import React, { useState, useEffect } from "react";
import axios from "axios";
import '../../styles/Niche-Management.css';

import LocationSelector from "../../components/LocationSelector";
import NicheLegend from "../../components/NicheLegend";
import NicheGrid from "../../components/NicheGrid";
import AddBlockModal from "../../components/AddBlockModal";
import EditSlotModal from "../../components/EditSlotModal";

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
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newSlot, setNewSlot] = useState({ row: "", col: "", status: "available" });
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [buildings, setBuildings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  const [newBlock, setNewBlock] = useState({
    buildingId: "",
    levelId: "",
    notes: "",
    rows: 1,
    cols: 1,
    status: "available"
  });


  // Fetch buildings on load
  useEffect(() => {
    axios.get("http://localhost:8888/api/niche/buildings")
      .then(res => {
        setBuildings(res.data);
        if (res.data.length > 0) setSelectedBuilding(res.data[0].buildingID);
      })
      .catch(err => console.error("Error fetching buildings:", err));
  }, []);

  // Fetch levels on building change
  useEffect(() => {
    if (!selectedBuilding) return;
    axios.get(`http://localhost:8888/api/niche/levels/${selectedBuilding}`)
      .then(res => {
        setLevels(res.data);
        if (res.data.length > 0) setSelectedLevel(res.data[0].levelID);
      })
      .catch(err => console.error("Error fetching levels:", err));
  }, [selectedBuilding]);

  // Fetch blocks on level change
  useEffect(() => {
    if (!selectedLevel) return;
    axios.get(`http://localhost:8888/api/niche/blocks/${selectedLevel}`)
      .then(res => {
        setBlocks(res.data);
        if (res.data.length > 0) setSelectedBlock(res.data[0].blockID);
      })
      .catch(err => console.error("Error fetching blocks:", err));
  }, [selectedLevel]);

  // Fetch slots on block change
  useEffect(() => {
    if (!selectedBlock) return;
    axios.get(`http://localhost:8888/api/niche/niches/${selectedBlock}`)
      .then((res) => {
        // map nicheID to id so modal reads it correctly
        const mapped = res.data.map((slot) => ({
          ...slot,
          id: slot.nicheID,
          status: slot.status.toLowerCase()
        }));

        setSlots(mapped);
      })

  }, [selectedBlock]);

  // Handlers
  const handleClick = (slot) => {
    if (!slot) return;
    setSelectedSlot(slot);
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
    setSlots(prev => [...prev, newSlotEntry]);
    setShowBlockModal(false);
    setNewSlot({ row: "", col: "", status: "available" });
  };

  const handleSaveSlot = () => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === selectedSlot.id ? selectedSlot : slot
      )
    );
    setShowEditModal(false);
  };

  const handleCreateBlock = () => {
    axios.post("http://localhost:8888/api/niche/create-block", newBlock)
      .then(res => {
        alert("Block and niches created!");
  
        // Refresh block dropdown
        return axios.get(`http://localhost:8888/api/niche/blocks/${newBlock.levelId}`);
      })
      .then(res => {
        setBlocks(res.data);
        if (res.data.length > 0) setSelectedBlock(res.data[res.data.length - 1].blockID);
      })
      .catch(err => {
        console.error("Error creating block:", err);
        alert("Failed to create block.");
      });
  
    setShowBlockModal(false);
    setNewBlock({
      buildingId: "",
      levelId: "",
      notes: "",
      rows: 1,
      cols: 1,
      status: "available"
    });
  };
  

  return (
    <div className="container mt-4">
      <h1>Niche Management</h1>

      <LocationSelector
        buildings={buildings}
        levels={levels}
        blocks={blocks}
        selectedBuilding={selectedBuilding}
        selectedLevel={selectedLevel}
        selectedBlock={selectedBlock}
        onBuildingChange={(e) => setSelectedBuilding(e.target.value)}
        onLevelChange={(e) => setSelectedLevel(e.target.value)}
        onBlockChange={(e) => setSelectedBlock(e.target.value)}
        onAddClick={() => setShowBlockModal(true)}
      />

      <NicheLegend statusClass={statusClass} />

      <NicheGrid
        slots={slots}
        statusClass={statusClass}
        onSlotClick={handleClick}
      />

      <AddBlockModal
        show={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSave={handleCreateBlock}
        newBlock={newBlock}
        setNewBlock={setNewBlock}
        buildings={buildings}
        levels={levels}
        statusClass={statusClass}
      />


      <EditSlotModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveSlot}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        statusClass={statusClass}
      />
    </div>
  );
}
