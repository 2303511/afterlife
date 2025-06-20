import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";

export default function Login() {
	const [form, setForm] = useState({ email: "", password: "" });
    
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const navigate = useNavigate();
	const handleLogin = async () => {
		try {
            const response = await axios.post('/api/user/login', form, {
				headers: {
					"Content-Type": "application/json"
				}
            });

			// Save session data
			sessionStorage.setItem("userId", response.data.user.userID);

			const role = response.data.user.role;

			if (role == "Applicant")
			{
				localStorage.setItem("role", "user");
				navigate("/my-bookings");
			} else {
				localStorage.setItem("role", role.toLowerCase());
				navigate("/dashboard");
			}
			
			// const role = localStorage.getItem("role");
			// console.log("this is the role:", role);

            return response.data;
        } catch (error) {
            console.error("Failed to login:", error);
            return null;
        }
	};

	return (
		<div className="container mt-5" style={{ maxWidth: "400px" }}>
			<h2 className="text-center mb-4">Login</h2>
			<form onSubmit={(e) => {e.preventDefault(); handleLogin();}}>
				{/* email address */}
				<div className="mb-3">
					<label className="form-label">Email</label>
					<input type="email" className="form-control" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter username" required />
				</div>

				{/* password */}
				<div className="mb-3">
					<label className="form-label">Password</label>
					<input type="password" className="form-control" name="password" value={form.password} onChange={handleInputChange} placeholder="Enter password" required />
				</div>

				{/* submit button */}
				<button type="submit" className="btn btn-primary w-100">
					Log In
				</button>
			</form>
			<p>Don't have an account yet? <a href="/register">Register here!</a></p>
		</div>
	);
}
