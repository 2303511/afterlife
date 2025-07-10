/* eslint-disable */

import { useState } from "react";
import FullNicheMap from "../../components/niche/FullNicheMap"; // adjust path if needed

export default function NicheManagement() {
  const [isForm, setIsForm] = useState(false);
  const [isBookButtonDisabled, setIsBookButtonDisabled] = useState(true);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [gridDisabled, setGridDisabled] = useState(false);

  const buildingState = {
    selectedBuilding,
    setSelectedBuilding,
    selectedLevel,
    setSelectedLevel,
    selectedBlock,
    setSelectedBlock,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    setSelectedSlot,
    gridDisabled,
    setGridDisabled,
  };

  const handleBook = () => {
    // Admin doesn’t book, but method is still passed in
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="max-w-screen-xl mx-auto">
        <FullNicheMap
          buildingState={buildingState}
          handleBook={handleBook}
          isBookButtonDisabled={isBookButtonDisabled}
          setIsBookButtonDisabled={setIsBookButtonDisabled}
          onlyAllowClickStatuses={["available", "reserved", "occupied", "pending"]}
          setIsForm={setIsForm}
        />
      </div>
    </div>
  );
}
