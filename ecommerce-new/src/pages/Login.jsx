import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, extractUserIdFromLoginResponse } from "../services/api";

function Login() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		email: "",
		password: ""
	});
	const [quickUserId, setQuickUserId] = useState("1");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await loginUser(form);
			const userId =
				extractUserIdFromLoginResponse(res.data) ||
				localStorage.getItem("registeredUserId");

			if (!userId) {
				setError("Login succeeded but user id was not returned by backend.");
				return;
			}

			localStorage.setItem("userId", String(userId));
			localStorage.removeItem("registeredUserId");
			navigate("/products", { replace: true });
		} catch (err) {
			const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
			if (typeof err?.response?.data === "string" && err.response.data.trim()) {
				setError(err.response.data);
			} else if (backendMessage) {
				setError(backendMessage);
			} else {
				setError("Login failed. Please check your credentials or use quick login below.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleQuickLogin = () => {
		const trimmed = String(quickUserId || "").trim();
		if (!/^\d+$/.test(trimmed)) {
			setError("Quick login requires a numeric user id.");
			return;
		}

		localStorage.setItem("userId", trimmed);
		setError("");
		navigate("/products", { replace: true });
	};

	const handleQuickLoginDefault = () => {
		localStorage.setItem("userId", "1");
		setError("");
		navigate("/products", { replace: true });
	};

	return (
		<div className="container auth-wrap">
			<section className="auth-card">
				<p className="eyebrow">Welcome Back</p>
				<h1>Login</h1>
				<p className="hero-copy">Access your account to continue shopping.</p>
				{error && <p className="status status-error">{error}</p>}

				<form onSubmit={handleSubmit} className="form-stack">
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
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>

				<div className="form-stack" style={{ marginTop: "0.9rem" }}>
					<input
						type="text"
						placeholder="Quick login user id (e.g. 1)"
						value={quickUserId}
						onChange={(e) => setQuickUserId(e.target.value)}
					/>
					<button className="btn-ghost" type="button" onClick={handleQuickLogin}>
						Continue with User ID
					</button>
					<button className="btn-ghost" type="button" onClick={handleQuickLoginDefault}>
						Quick Login as User 1
					</button>
				</div>

				<p className="auth-helper">
					Don&apos;t have an account? <Link to="/register">Register</Link>
				</p>
			</section>
		</div>
	);
}

export default Login