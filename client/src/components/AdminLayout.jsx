
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/layout.css";

export default function AdminLayout() {
    return (
        <div className="admin-container">

            <Sidebar />

            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}