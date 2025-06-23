import { useState, useEffect, useRef } from "react";

import axios from "axios";
import "../../styles/Niche-Management.css";

import LocationSelector from "./LocationSelector";
import NicheLegend from "./NicheLegend";
import NicheGrid from "./NicheGrid";
import EditSlotModal from "./EditSlotModal";

const statusClass = {
	available: "status-available",
	selected: "status-selected",
	occupied: "status-occupied",
	reserved: "status-reserved",
	booked: "status-booked",
	blocked: "status-blocked",
	pending: "status-pending"
};

export default function FullNicheMap({
    setIsForm,
    buildingState
}) {
    const [isEdit] = useState(sessionStorage.getItem("role") === "staff"); // if the user role is staff, then enable edit modal. else, no edit modal.
	const [slots, setSlots] = useState([]);
	const [showEditModal, setShowEditModal] = useState(false);

    // get building states
    const {
        selectedBuilding, setSelectedBuilding,
        selectedLevel, setSelectedLevel,
        selectedBlock, setSelectedBlock,
        selectedSlotId, setSelectedSlotId,
        selectedSlot, setSelectedSlot,
		gridDisabled, setGridDisabled
    } = buildingState

	const [buildings, setBuildings] = useState([]);
	const [levels, setLevels] = useState([]);
	const [blocks, setBlocks] = useState([]);

	const maxRow = slots.length > 0 ? Math.max(...slots.map((s) => s.nicheRow)) : 0;
	const maxCol = slots.length > 0 ? Math.max(...slots.map((s) => s.nicheColumn)) : 0;

	const bookingRef = useRef(null); // for editing/creating the thing in admin view

	// Fetch buildings on load
	useEffect(() => {
		axios
			.get("/api/niche/buildings")
			.then((res) => {
				setBuildings(res.data);
				if (res.data.length > 0) setSelectedBuilding(res.data[0].buildingID);
			})
			.catch((err) => console.error("Error fetching buildings:", err));
	}, []);

	// Fetch levels on building change
	useEffect(() => {
		if (!selectedBuilding) return;
		axios
			.get(`/api/niche/levels/${selectedBuilding}`)
			.then((res) => {
				setLevels(res.data);
				if (res.data.length > 0) setSelectedLevel(res.data[0].levelID);
			})
			.catch((err) => console.error("Error fetching levels:", err));
	}, [selectedBuilding]);

	// Fetch blocks on level change
	useEffect(() => {
		if (!selectedLevel) return;
		axios
			.get(`/api/niche/blocks/${selectedLevel}`)
			.then((res) => {
				setBlocks(res.data);
				if (res.data.length > 0) setSelectedBlock(res.data[0].blockID);
			})
			.catch((err) => console.error("Error fetching blocks:", err));
	}, [selectedLevel]);

	// Fetch slots on block change
	useEffect(() => {
		if (!selectedBlock) return;

		axios
			.get(`/api/niche/niches/${selectedBlock}`)
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
                if (isEdit && isSame) {
                    setShowEditModal(false);
                    return null;
                } else {
                    setShowEditModal(false); // make sure modal closes if opened from other slot
                    return slot.id;
                }
            });

            setSelectedSlot(slot);
            setIsForm(slot.status.toLowerCase() === "available"); // show the form segment
			setGridDisabled(true);
            
		} else {
			// Directly open modal for other statuses
			setSelectedSlot(slot);
			setSelectedSlotId(null); // Deselect any green box
            setIsForm(false); // show the form segment
			setGridDisabled(false);
            if (isEdit) {
                setShowEditModal(true);
            }
		}
	};

	const handleSaveSlot = () => {
		setSlots((prev) => prev.map((slot) => (slot.id === selectedSlot.id ? selectedSlot : slot)));
		setShowEditModal(false);
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
				handleBook={() => {}} // dont need to do anything
                isEdit={isEdit}
			/>

			<NicheLegend statusClass={statusClass} />
			<div className={`niche-grid-wrapper ${gridDisabled ? "grid-disabled" : ""}`}>
				<NicheGrid slots={slots} statusClass={statusClass} onSlotClick={gridDisabled ? () => {} : handleClick} selectedSlotId={selectedSlotId} numRows={maxRow} numCols={maxCol} />
			</div>

			{isEdit ? (
                <EditSlotModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveSlot}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    statusClass={statusClass}
                />
            ) : null}

		</div>
	);
}
