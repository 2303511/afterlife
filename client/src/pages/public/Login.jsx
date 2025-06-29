import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";
import ForgetPasswordModal from "./ForgetPasswordModal";

export default function Login() {
	const [showForget, setShowForget] = useState(false);
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");  
    
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const navigate = useNavigate();
	const handleLogin = async () => {
		setError("");
		try {
            const response = await axios.post('/api/user/login', form, {
				headers: {
					"Content-Type": "application/json"
				},
				withCredentials: true
            });

			const role = response.data.role;

			if (role == "user")
			{
				navigate("/my-bookings");
			} else if (role == "staff") {
				navigate("/dashboard");
			} else if (role == "admin") {
				navigate("/admin-dashboard");
			}

            return response.data;
        } catch (err) {
            if (err.response?.status === 401) {
				setError("Incorrect e-mail or password.");
			} else {
			setError("Something went wrong. Please try again.");
			}
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
					<button className="btn btn-link p-0 mt-2" onClick={() => setShowForget(true)}>
						Forget password?
					</button>

					<ForgetPasswordModal
						show={showForget}
						onClose={() => setShowForget(false)}
					/>
				</div>

				{error && (
					<div className="alert alert-danger py-2">{error}</div>
				)}

				{/* submit button */}
				<button type="submit" className="btn btn-primary w-100">
					Log In
				</button>
			</form>
			<p>Don't have an account yet? <a href="/register">Register here!</a></p>
		</div>
	);
}
