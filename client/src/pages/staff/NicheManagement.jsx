import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import '../../styles/Niche-Management.css';

import LocationSelector from "../../components/LocationSelector";
import NicheLegend from "../../components/NicheLegend";
import NicheGrid from "../../components/NicheGrid";
import EditSlotModal from "../../components/EditSlotModal";
import BookingForm from "../../components/BookingForm";


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
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const [newSlot, setNewSlot] = useState({ row: "", col: "", status: "available" });
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [gridDisabled, setGridDisabled] = useState(false);


  const [buildings, setBuildings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  const maxRow = slots.length > 0 ? Math.max(...slots.map(s => s.nicheRow)) : 0;
  const maxCol = slots.length > 0 ? Math.max(...slots.map(s => s.nicheColumn)) : 0;


  const bookingRef = useRef(null);



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

        const mapped = res.data
          .sort((a, b) => {
            if (a.nicheRow !== b.nicheRow) {
              return a.nicheRow - b.nicheRow; // row order
            }
            return a.nicheColumn - b.nicheColumn; // column order within row
          })
          .map((slot) => ({
            ...slot,
            id: slot.nicheID,
            status: slot.status.toLowerCase()
          }));


        setSlots(mapped);
      })
      .catch((err) => {
        console.error("Error fetching niches:", err);
      });
  }, [selectedBlock]);



  // Handlers
  const handleClick = (slot) => {
    if (!slot) return;

    if (slot.status.toLowerCase() === "available") {
      // Toggle green selection for available slot
      setSelectedSlotId((prevId) => {
        const isSame = prevId === slot.id;
        if (isSame) {
          setShowEditModal(false);
          return null;
        } else {
          setShowEditModal(false); // make sure modal closes if opened from other slot
          setSelectedSlot(slot);
          return slot.id;
        }
      });
    } else {
      // Directly open modal for other statuses
      setSelectedSlot(slot);
      setSelectedSlotId(null); // Deselect any green box
      setShowEditModal(true);
    }
  };

  const handleSaveSlot = () => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === selectedSlot.id ? selectedSlot : slot
      )
    );
    setShowEditModal(false);
  };

  const handleBook = () => {
    if (selectedSlot && selectedSlot.status === "available") {
      //navigate(`/add-booking?nicheID=${selectedSlot.id}`);
      setShowBooking(true);
      setGridDisabled(true);
      // Scroll to form
      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // delay ensures form is rendered
    }
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
        selectedSlot={selectedSlot}
        handleBook={handleBook}
      />

      <NicheLegend statusClass={statusClass} />
      <div className={`niche-grid-wrapper ${gridDisabled ? "grid-disabled" : ""}`}>
        <NicheGrid
          slots={slots}
          statusClass={statusClass}
          onSlotClick={gridDisabled ? () => { } : handleClick}
          selectedSlotId={selectedSlotId}
          numRows={maxRow}
          numCols={maxCol}
        />
      </div>



      <div ref={bookingRef}>
        {showBooking && (
          <BookingForm
            selectedSlot={selectedSlot}
            onCancel={() => {
              setShowBooking(false);
              setSelectedSlot(null);
              setSelectedSlotId(null);  
              setGridDisabled(false);
            }}
          />
        )}
      </div>





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
