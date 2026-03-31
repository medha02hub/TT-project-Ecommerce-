import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("userId"));
  const links = isAuthenticated
    ? [
        { to: "/products", label: "Products" },
        { to: "/cart", label: "Cart" },
        { to: "/orders", label: "Orders" },
        { to: "/admin", label: "Admin" }
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" }
      ];

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar-wrap">
      <div className="navbar container">
        <NavLink to={isAuthenticated ? "/products" : "/login"} className="brand-link">
          <span className="brand-mark" aria-hidden="true">ES</span>
          <span className="brand-text">E-Commerce Shop</span>
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <button className="btn-ghost" onClick={handleLogout} type="button">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;