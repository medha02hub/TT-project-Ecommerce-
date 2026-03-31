import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, extractUserIdFromLoginResponse } from "../services/api";

function Register() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: ""
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const res = await registerUser(form);
			const registeredUserId = extractUserIdFromLoginResponse(res.data);

			if (registeredUserId) {
				localStorage.setItem("registeredUserId", String(registeredUserId));
			}

			setSuccess("Registered successfully. Please login.");
			setTimeout(() => {
				navigate("/login", { replace: true });
			}, 700);
		} catch (err) {
			const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
			if (typeof err?.response?.data === "string" && err.response.data.trim()) {
				setError(err.response.data);
			} else if (backendMessage) {
				setError(backendMessage);
			} else {
				setError("Registration failed");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container auth-wrap">
			<section className="auth-card">
				<p className="eyebrow">Create Account</p>
				<h1>Register</h1>
				<p className="hero-copy">Join now and start building your cart faster.</p>
				{error && <p className="status status-error">{error}</p>}
				{success && <p className="status">{success}</p>}

				<form onSubmit={handleSubmit} className="form-stack">
					<input
						name="name"
						placeholder="Name"
						value={form.name}
						onChange={handleChange}
						required
					/>

					<input
						name="email"
						type="email"
						placeholder="Email"
						value={form.email}
						onChange={handleChange}
						required
					/>

					<input
						name="password"
						type="password"
						placeholder="Password"
						value={form.password}
						onChange={handleChange}
						required
					/>

					<button className="btn-primary" type="submit" disabled={loading}>
						{loading ? "Registering..." : "Register"}
					</button>
				</form>

				<p className="auth-helper">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</section>
		</div>
	);
}

export default Register