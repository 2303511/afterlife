import axios from "axios";

export const retrieveSession = async () => {
	try {
		const res = await axios.get("/api/user/me", { withCredentials: true });
		return res.data; // return the session data 
	} catch (err) {
		console.error("Failed to fetch session:", err);
		return null;
	}
};
