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
	const [user, setUser] = useState(undefined);

	useEffect(() => {
		axios.get("/api/user/me", { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => console.error("Failed to fetch session:", err));
	}, []);

	useEffect(() => {
		const storedID = user?.userID;
		const storedRole = user?.role;

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
