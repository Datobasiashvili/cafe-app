import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { formatDateGeorgian, formatTimeGeorgian } from "../utils/dateFormatter";
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

    const toggleOrderStatus = async (orderId, currentReady) => {
        const newReady = !currentReady;

        try {
            const response = await axios.patch(`${API_URL}/order/${orderId}/status`, 
                { ready: newReady },
                { withCredentials: true }
            );

            if (response.status === 200) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId
                            ? { ...order, ready: newReady }
                            : order
                    )
                );
            }
        } catch (error) {
            console.error('Error updating order status', error);
            setError(error.response?.data?.message || "Failed to update order status");
        }
    };

    return (
        <div className="orders-page-container">
            <h1 className="orders-page-title">შეკვეთები</h1>

            {error && <p className="orders-page-error">{error}</p>}

            {orders.length === 0 && !loading && !error ? (
                <p className="orders-page-empty">არ არის შეკვეთები.</p>
            ) : (
                <>
                    <div className="orders-page-list">
                        {orders.map((order) => (
                            <div key={order._id} className="orders-page-card">
                                <div className="orders-page-card-header">
                                    <span className="orders-page-card-id">
                                        {formatTimeGeorgian(order.createdAt)}
                                    </span>
                                    <span className="orders-page-card-date">
                                        {formatDateGeorgian(order.createdAt)}
                                    </span>
                                </div>

                                <table className="orders-page-table">
                                    <thead>
                                        <tr>
                                            <th>პროდუქტი</th>
                                            <th>ფასი</th>
                                            <th>რაოდ.</th>
                                            <th>ფასი</th>
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
                                    <span className="orders-page-card-total">ჯამში: ₾{order.totalPrice.toFixed(2)}</span>
                                    <div className="orders-page-card-actions">
                                        <button
                                            className={`orders-page-status-btn ${order.ready ? "ready" : ""}`}
                                            onClick={() => toggleOrderStatus(order._id, order.ready)}
                                            title={order.ready ? "მონიშნულია როგორც მზად" : "მონიშნე მზადად"}
                                        >
                                            {order.ready ? "✓ მზადაა" : "მზადდება"}
                                        </button>
                                        {user.role === "receptionist" && (
                                            <button
                                                className="orders-page-delete-btn"
                                                onClick={() => openDeleteModal(order._id)}
                                            >
                                                შეკვეთის წაშლა
                                            </button>
                                        )}
                                    </div>
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
                        <h3>დაადასტურეთ</h3>
                        <p>დარწმუნებული ხართ, რომ გინდათ შეკვეთის წაშლა? ამ შეკვეთის აღდგენა ვეღარ მოხდება.</p>
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={closeDeleteModal}>უკან დაბრუნება</button>
                            <button className="modal-confirm-btn" onClick={confirmDelete}>წაშლა</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}