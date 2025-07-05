import { useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";

import FullNicheMap from "../../components/niche/FullNicheMap";
import FullFormFlow from "../../components/booking/FullFormFlow";

export default function NicheBooking() {
	const [isForm, setIsForm] = useState(false);
	const formRef = useRef(null);

	// to pass data from FullNicheMap to FullFormFlow
	const [selectedBuilding, setSelectedBuilding] = useState("");
	const [selectedLevel, setSelectedLevel] = useState("");
	const [selectedBlock, setSelectedBlock] = useState("");
	const [gridDisabled, setGridDisabled] = useState(false);
	const [isBookButtonDisabled, setIsBookButtonDisabled] = useState(true);

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
		setIsBookButtonDisabled(true);
		document.getElementById("niche-grid-wrapper")?.scrollIntoView({ behavior: "smooth" });
	};

	const handleBook = () => {
		setIsForm(true); // show the form
		setGridDisabled(true);
		setIsBookButtonDisabled(false);
		setTimeout(() => {
			formRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100); // slight delay to ensure rendering
	};

	return (
		<Container fluid>
			<h2>Niche Booking</h2>
			<Row>
				<Col xs={12} md={12} lg={12} xl={12}>
					<FullNicheMap setIsForm={setIsForm} buildingState={buildingState} handleBook={handleBook} isBookButtonDisabled={isBookButtonDisabled} setIsBookButtonDisabled={setIsBookButtonDisabled} />
				</Col>
				<Col xs={12} ref={formRef}>
					{isForm && (
						<>
							<FullFormFlow selectedSlot={selectedSlot} onCancel={onCancel} setIsBookButtonDisabled={setIsBookButtonDisabled} setIsForm={setIsForm} />
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
}
