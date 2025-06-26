import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import '../../styles/Niche-Management.css';

import LocationSelector from "../../components/niche/LocationSelector";
import NicheLegend from "../../components/niche/NicheLegend";
import NicheGrid from "../../components/niche/NicheGrid";
import EditSlotModal from "../../components/niche/EditSlotModal";
import BookingForm from "../../components/booking/BookingForm";
import PaymentForm from "../../components/booking/PaymentForm";

// for error toasts
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  const isEdit = useState(sessionStorage.getItem("role")== "staff" ? true : false); // if the user role is staff, then enable edit modal. else, no edit modal.
  
  const [slots, setSlots] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

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
  const [step, setStep] = useState("booking"); // or 'payment'
  const [bookingFormData, setBookingFormData] = useState(null);

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
    axios.get(`/api/niche/levels/${selectedBuilding}`)
      .then(res => {
        setLevels(res.data);
        if (res.data.length > 0) setSelectedLevel(res.data[0].levelID);
      })
      .catch(err => console.error("Error fetching levels:", err));
  }, [selectedBuilding]);

  // Fetch blocks on level change
  useEffect(() => {
    if (!selectedLevel) return;
    axios.get(`/api/niche/blocks/${selectedLevel}`)
      .then(res => {
        setBlocks(res.data);
        if (res.data.length > 0) setSelectedBlock(res.data[0].blockID);
      })
      .catch(err => console.error("Error fetching blocks:", err));
  }, [selectedLevel]);

  // Fetch slots on block change
  useEffect(() => {
    if (!selectedBlock) return;

    axios.get(`/api/niche/niches/${selectedBlock}`)
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

  const handleSubmit = async (paymentData) => {
    if (!bookingFormData || !selectedSlot) {
      console.error("Missing form or slot data");
      return;
    }
  
    bookingFormData.append("paymentMethod", paymentData.method);
    bookingFormData.append("paymentAmount", paymentData.amount);
  
    /*for (let pair of bookingFormData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }*/
    try {
      const res = await axios.post(
        "/api/booking/submitStaffBooking",
        bookingFormData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      if (res.data.success) {

        alert(`Booking submitted! Booking ID: ${res.data.bookingID}`);
  
        // reset states
        setStep("booking");
        setShowBooking(false);
        setSelectedSlot(null);
        setSelectedSlotId(null);
        setGridDisabled(false);
        setBookingFormData(null);

        // refresh niche
        axios.get(`/api/niche/niches/${selectedBlock}`)
        .then((res) => {
          const mapped = res.data
            .sort((a, b) => {
              if (a.nicheRow !== b.nicheRow) return a.nicheRow - b.nicheRow;
              return a.nicheColumn - b.nicheColumn;
            })
            .map((slot) => ({
              ...slot,
              id: slot.nicheID,
              status: slot.status.toLowerCase()
            }));
      
          setSlots(mapped);
        })
        .catch((err) => {
          console.error("Error refreshing niches:", err);
        });
      
  
      } else if (res.data.errors) {
        res.data.errors.map((err) => {
          toast.error(err);
        })
        
        setStep("booking"); // Go back to form
      }
  
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Backend sent validation errors
        for (const [key, value] of Object.entries(err.response.data.errors)) {
          toast.error(value);
        }

        setStep("booking");
      } else {
        console.error("Booking failed:", err);
        alert("Server error — failed to submit booking.");
      }
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
        isEdit={isEdit}
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
        {showBooking && step === "booking" && (
          <BookingForm
            selectedSlot={selectedSlot}
            onCancel={() => {
              setShowBooking(false);
              setSelectedSlot(null);
              setSelectedSlotId(null);
              setGridDisabled(false);
            }}
            onSubmit={(formData) => {
              setBookingFormData(formData); // temporarily store data
              setStep("payment"); // go to payment step
            }}
          />
        )}
      </div>

      {step === "payment" && (
        <PaymentForm
          onBack={() => setStep("booking")}
          onSubmit={handleSubmit} // real DB submission happens here
        />
      )}

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
