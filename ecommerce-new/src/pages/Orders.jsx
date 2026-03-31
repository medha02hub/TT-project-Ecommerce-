import { useEffect, useState, useCallback } from "react";
import { getLoggedInUserId, getOrders, resolveOrderTotal } from "../services/api";

function Orders() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const userId = getLoggedInUserId();

	// ✅ FIXED: useCallback added
	const loadOrders = useCallback(async () => {
		if (!userId) {
			setError("Please login to view your orders.");
			setOrders([]);
			return;
		}

		try {
			setLoading(true);
			setError("");
			const res = await getOrders(userId);
			setOrders(res.data || []);
		} catch (err) {
			setError("Could not load your orders.");
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	// ✅ FIXED: dependency added
	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	return (
		<div className="container page-stack">
			<section className="hero-panel compact">
				<p className="eyebrow">Orders</p>
				<h1>Track your placed orders</h1>
				<p className="hero-copy">
					View all orders created using your logged in account.
				</p>
			</section>

			<div className="cart-actions">
				<button className="btn-primary" onClick={loadOrders}>
					Refresh Orders
				</button>
			</div>

			{error && <p className="status status-error">{error}</p>}
			{loading && <p className="status">Loading orders...</p>}
			{!loading && !error && !orders.length && (
				<p className="status">No orders found.</p>
			)}

			<section className="cart-list">
				{orders.map((order) => (
					<article
						className="cart-item"
						key={order.id || `${order.userId}-${order.total}`}
					>
						<p><strong>Order ID:</strong> {order.id ?? "N/A"}</p>
						<p><strong>User ID:</strong> {order.userId ?? userId}</p>
						<p>
							<strong>Total:</strong> ₹
							{new Intl.NumberFormat("en-IN").format(resolveOrderTotal(order))}
						</p>
						<p><strong>Status:</strong> {order.status || "PLACED"}</p>
					</article>
				))}
			</section>
		</div>
	);
}

export default Orders;