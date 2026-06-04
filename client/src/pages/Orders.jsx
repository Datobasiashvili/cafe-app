import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/orders.css";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchOrders = useCallback(async (pageNum) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/order?page=${pageNum}`, { withCredentials: true });
            if (response.status === 200) {
                const { orders: newOrders, pagination } = response.data;
                setOrders((prev) => pageNum === 1 ? newOrders : [...prev, ...newOrders]);
                setHasMore(pagination.hasMore);
            }
        } catch (error) {
            console.error('Error fetching orders', error);
            setError(error.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    const openDeleteModal = (orderId) => {
        setOrderToDelete(orderId);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setOrderToDelete(null);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            await axios.delete(`${API_URL}/order/${orderToDelete}`, { withCredentials: true });
            setOrders((prev) => prev.filter((order) => order._id !== orderToDelete));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting order', error);
            setError(error.response?.data?.message || "Failed to delete order");
            closeDeleteModal();
        }
    };

    return (
        <div className="orders-page-container">
            <h1 className="orders-page-title">Latest Orders</h1>

            {error && <p className="orders-page-error">{error}</p>}

            {orders.length === 0 && !loading && !error ? (
                <p className="orders-page-empty">No orders found.</p>
            ) : (
                <>
                    <div className="orders-page-list">
                        {orders.map((order) => (
                            <div key={order._id} className="orders-page-card">
                                <div className="orders-page-card-header">
                                    <span className="orders-page-card-id">
                                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                                            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
                                        })}
                                    </span>
                                    <span className="orders-page-card-date">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric"
                                        })}
                                    </span>
                                </div>

                                <table className="orders-page-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.product}</td>
                                                <td>₾{item.price.toFixed(2)}</td>
                                                <td>{item.quantity}</td>
                                                <td>₾{item.subTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="orders-page-card-footer">
                                    <span className="orders-page-card-total">Total: ₾{order.totalPrice.toFixed(2)}</span>
                                    {user.role === "receptionist" && (
                                        <button
                                            className="orders-page-delete-btn"
                                            onClick={() => openDeleteModal(order._id)}
                                        >
                                            Delete Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <button className="orders-page-show-more-btn" onClick={() => { setPage(page + 1); fetchOrders(page + 1); }} disabled={loading}>
                            {loading ? "Loading..." : "Show More"}
                        </button>
                    )}
                </>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={closeDeleteModal}>Cancel</button>
                            <button className="modal-confirm-btn" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}