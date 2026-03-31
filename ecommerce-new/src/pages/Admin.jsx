import { useEffect, useState } from "react";
import { addProduct, deleteProduct, getProducts } from "../services/api";

function Admin() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [form, setForm] = useState({
		name: "",
		description: "",
		price: ""
	});

	const loadProducts = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await getProducts();
			setProducts(res.data || []);
		} catch (err) {
			setError("Could not load products for admin panel.");
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProducts();
	}, []);

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleAddProduct = async (e) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError("");
			setSuccess("");
			await addProduct({
				name: form.name.trim(),
				description: form.description.trim(),
				price: Number(form.price)
			});
			setForm({ name: "", description: "", price: "" });
			setSuccess("Product added successfully.");
			loadProducts();
		} catch (err) {
			setError("Could not add product.");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteProduct = async (id) => {
		try {
			setDeletingId(id);
			setError("");
			setSuccess("");
			await deleteProduct(id);
			setProducts((prev) => prev.filter((item) => item.id !== id));
			setSuccess("Product deleted successfully.");
		} catch (err) {
			setError("Could not delete product. Verify backend delete endpoint.");
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="container page-stack">
			<section className="hero-panel compact">
				<p className="eyebrow">Admin Panel</p>
				<h1>Manage products</h1>
				<p className="hero-copy">Add new products and remove old products from catalog.</p>
			</section>

			{error && <p className="status status-error">{error}</p>}
			{success && <p className="status">{success}</p>}

			<section className="admin-card">
				<h3>Add Product</h3>
				<form onSubmit={handleAddProduct} className="form-stack">
					<input
						name="name"
						placeholder="Product name"
						value={form.name}
						onChange={handleChange}
						required
					/>
					<input
						name="description"
						placeholder="Description"
						value={form.description}
						onChange={handleChange}
						required
					/>
					<input
						name="price"
						type="number"
						step="0.01"
						min="0"
						placeholder="Price"
						value={form.price}
						onChange={handleChange}
						required
					/>
					<button className="btn-primary" type="submit" disabled={saving}>
						{saving ? "Adding..." : "Add Product"}
					</button>
				</form>
			</section>

			<section className="admin-card">
				<div className="admin-header-row">
					<h3>Existing Products</h3>
					<button className="btn-ghost" onClick={loadProducts}>Refresh</button>
				</div>

				{loading && <p className="status">Loading products...</p>}
				{!loading && !products.length && <p className="status">No products available.</p>}

				<div className="admin-list">
					{products.map((p) => (
						<article key={p.id} className="admin-item">
							<div>
								<p><strong>{p.name}</strong></p>
								<p>ID: {p.id}</p>
								<p>Price: ₹{new Intl.NumberFormat("en-IN").format(Number(p.price) || 0)}</p>
							</div>
							<button
								className="btn-ghost"
								onClick={() => handleDeleteProduct(p.id)}
								disabled={deletingId === p.id}
							>
								{deletingId === p.id ? "Deleting..." : "Delete Product"}
							</button>
						</article>
					))}
				</div>
			</section>
		</div>
	);
}

export default Admin;