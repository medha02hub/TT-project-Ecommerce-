import { useEffect, useMemo, useState, useCallback } from "react";
import {
	getCart,
	placeOrder,
	removeFromCart,
	getLoggedInUserId,
	resolveLineItemTotal,
	enrichCartWithProductPrices
} from "../services/api";

function Cart() {
	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(false);
	const [placingOrder, setPlacingOrder] = useState(false);
	const [removingId, setRemovingId] = useState(null);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const userId = getLoggedInUserId();

	// ✅ Memoized total
	const estimatedTotal = useMemo(() => {
		return cart.reduce((sum, item) => sum + resolveLineItemTotal(item), 0);
	}, [cart]);

	// ✅ FIXED: useCallback added
	const loadCart = useCallback(async () => {
		if (!userId) {
			setError("Please login to view cart.");
			setCart([]);
			return;
		}

		try {
			setLoading(true);
			setError("");
			const res = await getCart(userId);
			const rawItems = res.data || [];
			const enrichedItems = await enrichCartWithProductPrices(rawItems);
			setCart(enrichedItems);
		} catch (err) {
			setError("Could not load cart.");
			setCart([]);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	// ✅ FIXED: dependency added
	useEffect(() => {
		loadCart();
	}, [loadCart]);

	const order = async () => {
		if (!userId) {
			setError("Please login to place an order.");
			return;
		}

		if (!cart.length) {
			setError("Your cart is empty.");
			return;
		}

		try {
			setPlacingOrder(true);
			setError("");
			setSuccessMessage("");
			await placeOrder({
				userId,
				total: estimatedTotal
			});
			setSuccessMessage("Order placed successfully.");
			setCart([]);
		} catch (err) {
			setError("Could not place order.");
		} finally {
			setPlacingOrder(false);
		}
	};

	const removeItem = async (id) => {
		try {
			setRemovingId(id);
			setError("");
			await removeFromCart(id);
			setCart((prev) => prev.filter((item) => item.id !== id));
		} catch (err) {
			setError("Could not remove item from cart.");
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<div className="container page-stack">
			<section className="hero-panel compact">
				<p className="eyebrow">Your Cart</p>
				<h1>Review your selected items.</h1>
				<p className="hero-copy">
					Refresh the latest cart state and place your order in one tap.
				</p>
			</section>

			<div className="cart-actions">
				<button className="btn-primary" onClick={loadCart}>
					Refresh Cart
				</button>
				<button
					className="btn-ghost"
					onClick={order}
					disabled={!cart.length || placingOrder}
				>
					{placingOrder ? "Placing..." : "Place Order"}
				</button>
			</div>

			{error && <p className="status status-error">{error}</p>}
			{successMessage && <p className="status">{successMessage}</p>}
			{loading && <p className="status">Loading cart...</p>}

			{!loading && !error && cart.length === 0 && (
				<p className="status">Your cart is empty.</p>
			)}

			<section className="cart-list">
				{cart.map((item) => (
					<article className="cart-item" key={item.id}>
						<p><strong>Product ID:</strong> {item.productId}</p>
						<p><strong>Quantity:</strong> {item.quantity}</p>

						<button
							className="btn-ghost"
							onClick={() => removeItem(item.id)}
							disabled={removingId === item.id}
						>
							{removingId === item.id ? "Removing..." : "Remove from Cart"}
						</button>
					</article>
				))}
			</section>

			<div className="cart-total">
				<span>Estimated Total</span>
				<strong>
					₹{new Intl.NumberFormat("en-IN").format(estimatedTotal || 0)}
				</strong>
			</div>
		</div>
	);
}

export default Cart;