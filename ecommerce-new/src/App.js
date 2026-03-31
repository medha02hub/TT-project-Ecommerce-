import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import "./index.css";

function ProtectedRoute({ children }) {
	if (!localStorage.getItem("userId")) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

function PublicOnlyRoute({ children }) {
	if (localStorage.getItem("userId")) {
		return <Navigate to="/products" replace />;
	}

	return children;
}

function RootRedirect() {
	return <Navigate to={localStorage.getItem("userId") ? "/products" : "/login"} replace />;
}

function App() {
	return (
		<BrowserRouter>
			<Navbar />

			<main className="page-shell">
				<Routes>
					<Route path="/" element={<RootRedirect />} />

					<Route
						path="/login"
						element={
							<PublicOnlyRoute>
								<Login />
							</PublicOnlyRoute>
						}
					/>

					<Route
						path="/register"
						element={
							<PublicOnlyRoute>
								<Register />
							</PublicOnlyRoute>
						}
					/>

					<Route
						path="/products"
						element={
							<ProtectedRoute>
								<Products />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/cart"
						element={
							<ProtectedRoute>
								<Cart />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin"
						element={
							<ProtectedRoute>
								<Admin />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/orders"
						element={
							<ProtectedRoute>
								<Orders />
							</ProtectedRoute>
						}
					/>

					<Route path="*" element={<RootRedirect />} />
				</Routes>
			</main>
		</BrowserRouter>
	);
}

export default App;