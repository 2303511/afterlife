/* eslint-disable */

import { useState, useEffect, useRef } from "react";

import axios from "axios";

import LocationSelector from "./LocationSelector";
import NicheLegend from "./NicheLegend";
import NicheGrid from "./NicheGrid";
import EditSlotModal from "./EditSlotModal";

const statusClass = {
	available: "status-available",
	selected: "status-selected",
	occupied: "status-occupied",
	reserved: "status-reserved",
	pending: "status-pending"
};

export default function FullNicheMap({
	setIsForm,
	buildingState,
	handleBook = () => { },
	isBookButtonDisabled = false,
	setIsBookButtonDisabled = () => { }
}) {
	const [user, setUser] = useState(undefined);
	const [slots, setSlots] = useState([]);
	const [showEditModal, setShowEditModal] = useState(false);
	const [buildings, setBuildings] = useState([]);
	const [levels, setLevels] = useState([]);
	const [blocks, setBlocks] = useState([]);

	const {
		selectedBuilding, setSelectedBuilding,
		selectedLevel, setSelectedLevel,
		selectedBlock, setSelectedBlock,
		selectedSlotId, setSelectedSlotId,
		selectedSlot, setSelectedSlot,
		gridDisabled, setGridDisabled
	} = buildingState;

	const maxRow = slots.length > 0 ? Math.max(...slots.map((s) => s.nicheRow)) : 0;
	const maxCol = slots.length > 0 ? Math.max(...slots.map((s) => s.nicheColumn)) : 0;

	const bookingRef = useRef(null);

	useEffect(() => {
		axios.get("/api/user/me", { withCredentials: true })
			.then(res => setUser(res.data))
			.catch(err => console.error("Failed to fetch session:", err));
	}, []);

	useEffect(() => {
		axios.get("/api/niche/buildings")
			.then((res) => {
				setBuildings(res.data);
				if (res.data.length > 0) setSelectedBuilding(res.data[0].buildingID);
			})
			.catch((err) => console.error("Error fetching buildings:", err));
	}, []);

	useEffect(() => {
		if (!selectedBuilding) return;
		axios.get(`/api/niche/levels/${selectedBuilding}`)
			.then((res) => {
				setLevels(res.data);
				if (res.data.length > 0) setSelectedLevel(res.data[0].levelID);
			})
			.catch((err) => console.error("Error fetching levels:", err));
	}, [selectedBuilding]);

	useEffect(() => {
		if (!selectedLevel) return;
		axios.get(`/api/niche/blocks/${selectedLevel}`)
			.then((res) => {
				setBlocks(res.data);
				if (res.data.length > 0) setSelectedBlock(res.data[0].blockID);
			})
			.catch((err) => console.error("Error fetching blocks:", err));
	}, [selectedLevel]);

	useEffect(() => {
		if (!selectedBlock) return;
		axios.get(`/api/niche/niches/${selectedBlock}`)
			.then((res) => {
				const mapped = res.data
					.sort((a, b) => a.nicheRow - b.nicheRow || a.nicheColumn - b.nicheColumn)
					.map((slot) => ({
						...slot,
						id: slot.nicheID,
						status: slot.status.toLowerCase()
					}));
				setSlots(mapped);
			})
			.catch((err) => console.error("Error fetching niches:", err));
	}, [selectedBlock]);

	const handleClick = (slot) => {
		if (!slot || !user) return;
		const normalizedStatus = slot.status.toLowerCase();
		const role = user.role;

		setSelectedSlot(slot);
		setGridDisabled(false);

		if (normalizedStatus === "available") {
			if (role === "admin") {
				setSelectedSlot(slot);
				setSelectedSlotId(null); // admin doesn’t need selection highlight
				setShowEditModal(true);
				setIsForm(false);
				return;
			}

			// staff/user logic
			setSelectedSlotId((prevId) => {
				const isSame = prevId === slot.id;
				if (isSame) {
					setIsForm(false);
					return null;
				} else {
					setIsForm(true);
					setIsBookButtonDisabled(false);
					return slot.id;
				}
			});
		}
		else {
			setSelectedSlotId(null);
			setIsForm(false);
			setShowEditModal(role === "admin");
		}
	};

	const handleSaveSlot = async () => {
		try {
			await axios.post("/api/niche/update-status", {
				nicheID: selectedSlot.id,
				newStatus: selectedSlot.status.charAt(0).toUpperCase() + selectedSlot.status.slice(1),
				reason: selectedSlot.overrideReason 
			  });
			  
			// Update local state for optimistic UI
			setSlots((prev) =>
				prev.map((slot) => (slot.id === selectedSlot.id ? selectedSlot : slot))
			);
	
			setShowEditModal(false);
		} catch (err) {
			console.error("Failed to update niche status:", err);
			alert("Failed to update status. Please try again.");
		}
	};
	

	if (!user) return null;

	const isEdit = user.role === "admin";

	return (
		<div className={`container mt-4 ${user.role === "staff" || user.role === "admin" ? "d-flex flex-column align-items-center" : ""}`}>
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
				isBookButtonDisabled={isBookButtonDisabled}
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

			{isEdit && (
				<EditSlotModal
					show={showEditModal}
					onClose={() => setShowEditModal(false)}
					onSave={handleSaveSlot}
					selectedSlot={selectedSlot}
					setSelectedSlot={setSelectedSlot}
					statusClass={statusClass}
				/>
			)}
		</div>
	);
}
