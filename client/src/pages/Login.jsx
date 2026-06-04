import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser }  = useAuth();

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                { username: userName, password },
                { withCredentials: true }
            );

            if (response.status === 201) {
                const userRes = await axios.get(`${API_URL}/auth/check-me`, { withCredentials: true });

                setUser(userRes.data.user);

                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit}>
                <h2>Admin Login</h2>

                {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}