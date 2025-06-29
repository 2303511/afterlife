import { useEffect, useState } from "react";

import MainNavigation from "../../components/navigation/MainNavigation";

function mainContent() {
	return (
		<div className="container mt-5">
			<h1 className="text-center mb-4">All Bookings</h1>
			<p>Bookings will be displayed here.</p>
		</div>
	);
}

export default function AllBookings() {
	const [userID, setUserID] = useState(null);
	const [userRole, setUserRole] = useState(null);

	useEffect(() => {
		const storedID = sessionStorage.getItem("userID");
		const storedRole = sessionStorage.getItem("userRole");

		console.log("userRole:", userRole, typeof userRole);

		setUserID(storedID);
		setUserRole(storedRole);

		// TODO: get bookings for the user
	}, []);

	if (!userRole) return null; // or a loading indicator

	return userRole === "user" ? (
		<>
			<MainNavigation />
			mainContent();
		</>
	) : (
		// <MainLayout>
		mainContent()
		// </MainLayout>
	);
}
