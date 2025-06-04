// src/pages/LoginPage.js
import { useState } from "react";

export default function Login() {
	const [form, setForm] = useState({ email: "", password: "" });
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
        console.log("Submitting form:", form);
        
		// TODO: implement API login logic here
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Login response:", data);
        })
        .catch((error) => {
            console.error("Login failed:", error);
        });
	};

	return (
		<div className="container mt-5" style={{ maxWidth: "400px" }}>
			<h2 className="text-center mb-4">Login</h2>
			<form onSubmit={handleSubmit}>
				{/* email address */}
				<div className="mb-3">
					<label className="form-label">Email Address</label>
					<input type="email" className="form-control" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter email" required />
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
		</div>
	);
}
