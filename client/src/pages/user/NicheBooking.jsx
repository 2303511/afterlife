import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import FullNicheMap from "../../components/niche/FullNicheMap";
import FullFormFlow from "../../components/booking/FullFormFlow";

export default function NicheBooking() {
	const [isForm, setIsForm] = useState(false);

	// to pass data from FullNicheMap to FullFormFlow
	const [selectedBuilding, setSelectedBuilding] = useState("");
	const [selectedLevel, setSelectedLevel] = useState("");
	const [selectedBlock, setSelectedBlock] = useState("");
	const [gridDisabled, setGridDisabled] = useState(false);

	// selectedSlotId = ID of the selected Slot
	const [selectedSlotId, setSelectedSlotId] = useState(null);
	// selectedSlot = details of the selectedSlot
	const [selectedSlot, setSelectedSlot] = useState(null);

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
        setGridDisabled
	};

    const onCancel = () => {
        setSelectedSlotId(null); // Deselect any green box
        setIsForm(false); // show the form segment
        setGridDisabled(false);
    }

	return (
		<Container fluid>
			<Row>
				<Col xs={12} md={12} lg={12} xl={8}>
					<FullNicheMap setIsForm={setIsForm} buildingState={buildingState} />
				</Col>
				<Col xs={12} md={12} lg={12} xl={4}>
					{isForm && (
						<>
							<FullFormFlow selectedSlot={selectedSlot} onCancel={onCancel} setIsForm={setIsForm}/>
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
}
