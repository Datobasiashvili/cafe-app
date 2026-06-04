import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { NAV_LINKS } from "../data/navLinks";

export default function Sidebar() {
    const { user, setUser } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

            setUser(null);

        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon" />
                <span className="sidebar-logo-text">{user.role}</span>
            </div>

            {/* Divider */}
            <div className="sidebar-divider" />

            {/* Nav */}
            <nav className="sidebar-nav">
                {NAV_LINKS.map(({ label, route, icon }) => (
                    <NavLink
                        key={route}
                        to={route}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? " sidebar-link--active" : ""}`
                        }
                    >
                        <span className="sidebar-link-icon">{icon}</span>
                        <span className="sidebar-link-label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-divider" />
                <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                    <span className="sidebar-link-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </span>
                    <span className="sidebar-link-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}