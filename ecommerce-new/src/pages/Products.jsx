import { useEffect, useState } from "react";
import { getProducts, searchProducts, addToCart, getLoggedInUserId } from "../services/api";
import ProductCard from "../components/ProductCard";

function Products() {
	const [products, setProducts] = useState([]);
	const [keyword, setKeyword] = useState("");
	const [loading, setLoading] = useState(false);
	const [addingProductId, setAddingProductId] = useState(null);
	const [error, setError] = useState("");
	const userId = getLoggedInUserId();

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await getProducts();
			setProducts(res.data || []);
		} catch (err) {
			setError("Could not load products. Make sure backend is running.");
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	const search = async () => {
		if (!keyword.trim()) {
			loadProducts();
			return;
		}

		try {
			setLoading(true);
			setError("");
			const res = await searchProducts(keyword.trim());
			setProducts(res.data || []);
		} catch (err) {
			setError("Search failed. Try again in a moment.");
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	const addCart = async (id) => {
		if (!userId) {
			setError("Please login to add products to cart.");
			return;
		}

		try {
			setAddingProductId(id);
			setError("");
			await addToCart({
				userId,
				productId: id,
				quantity: 1
			});
			alert("Added to cart");
		} catch (err) {
			setError("Could not add to cart.");
		} finally {
			setAddingProductId(null);
		}
	};

	return (
		<div className="container page-stack">
			<section className="hero-panel">
				<p className="eyebrow">Shop Interface</p>
				<h1>Find products you actually want to buy.</h1>
				<p className="hero-copy">
					Search, browse, and add items quickly with a cleaner storefront experience.
				</p>

				<div className="search-row">
					<input
						value={keyword}
						placeholder="Search product"
						onChange={(e) => setKeyword(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && search()}
					/>
					<button className="btn-primary" onClick={search}>Search</button>
					<button className="btn-ghost" onClick={loadProducts}>Reset</button>
				</div>
			</section>

			{error && <p className="status status-error">{error}</p>}
			{loading && <p className="status">Loading products...</p>}
			{!loading && !error && products.length === 0 && (
				<p className="status">No products found.</p>
			)}

			<section className="product-grid">
				{products.map((p) => (
					<ProductCard
						key={p.id}
						product={p}
						addToCart={addCart}
						isAdding={addingProductId === p.id}
					/>
				))}
			</section>
		</div>
	);
}

export default Products