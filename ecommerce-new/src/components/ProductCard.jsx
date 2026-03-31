function ProductCard({ product, addToCart, isAdding = false }) {
  const formattedPrice = new Intl.NumberFormat("en-IN").format(product.price || 0);

  return (
    <article className="product-card">
      <div className="product-chip">Featured</div>
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>

      <div className="product-footer">
        <p className="product-price">₹{formattedPrice}</p>
        <button className="btn-primary" onClick={() => addToCart(product.id)} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;