import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/settings.css";

export default function Settings() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [activeTab, setActiveTab] = useState("products");
  const [deletingId, setDeletingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/product`, {
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (error) {
      setMessage("Failed to fetch products");
      setMessageType("error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product) => {
    setEditingId(product._id);
    setEditValues({
      product: product.product,
      price: product.price,
      category: product.category,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleUpdateProduct = async () => {
    if (!editValues.product || !editValues.price || !editValues.category) {
      setMessage("All fields are required");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/product/${editingId}`,
        editValues,
        { withCredentials: true }
      );

      setMessage("Product updated successfully");
      setMessageType("success");
      setEditingId(null);
      setEditValues({});

      // Update local state
      setProducts(
        products.map((p) =>
          p._id === editingId ? { ...p, ...editValues } : p
        )
      );

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update product");
      setMessageType("error");
      console.error(error);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/product/${id}`, {
        withCredentials: true,
      });

      setMessage("Product deleted successfully");
      setMessageType("success");
      setProducts(products.filter((p) => p._id !== id));
      setDeletingId(null);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete product");
      setMessageType("error");
      console.error(error);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Group products by category
  const groupedByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groupedByCategory).sort();

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your products and system settings</p>
      </div>

      {message && (
        <div className={`settings-message settings-message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`settings-tab-btn ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          System Settings
        </button>
      </div>

      {activeTab === "products" && (
        <div className="settings-content">
          <div className="settings-section">
            <h2>Product Management</h2>
            <p className="settings-subtitle">
              Edit product prices and details below
            </p>

            {loading && products.length === 0 ? (
              <div className="settings-loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="settings-empty">No products found</div>
            ) : (
              <div className="products-list">
                {categories.map((category) => (
                  <div key={category} className="category-section">
                    <h3 className="category-title">{category}</h3>
                    <div className="products-grid">
                      {groupedByCategory[category].map((product) => (
                        <div
                          key={product._id}
                          className={`product-card ${
                            editingId === product._id ? "editing" : ""
                          }`}
                        >
                          {editingId === product._id ? (
                            // Edit mode
                            <div className="edit-form">
                              <div className="form-group">
                                <label>Product Name</label>
                                <input
                                  type="text"
                                  value={editValues.product}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      product: e.target.value,
                                    })
                                  }
                                  className="form-input"
                                />
                              </div>

                              <div className="form-group">
                                <label>Price (₾)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editValues.price}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      price: parseFloat(e.target.value),
                                    })
                                  }
                                  className="form-input"
                                />
                              </div>

                              <div className="form-group">
                                <label>Category</label>
                                <input
                                  type="text"
                                  value={editValues.category}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      category: e.target.value,
                                    })
                                  }
                                  className="form-input"
                                />
                              </div>

                              <div className="form-actions">
                                <button
                                  onClick={handleUpdateProduct}
                                  disabled={loading}
                                  className="btn-save"
                                >
                                  {loading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={loading}
                                  className="btn-cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="product-content">
                              <div className="product-info">
                                <h4 className="product-name">{product.product}</h4>
                                <p className="product-category">{product.category}</p>
                              </div>

                              <div className="product-price">
                                ₾{product.price.toFixed(2)}
                              </div>

                              <div className="product-actions">
                                <button
                                  onClick={() => startEditing(product)}
                                  className="btn-edit"
                                  disabled={loading}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="btn-delete"
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "system" && (
        <div className="settings-content">
          <div className="settings-section">
            <h2>System Settings</h2>

            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Database</h3>
                </div>
                <div className="settings-card-content">
                  <p>Total Products: <strong>{products.length}</strong></p>
                  <p>Total Categories: <strong>{categories.length}</strong></p>
                  <p className="settings-description">
                    Monitor your database statistics and product inventory.
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Security</h3>
                </div>
                <div className="settings-card-content">
                  <p>Role: <strong>Receptionist</strong></p>
                  <p>Settings Access: <strong>Enabled</strong></p>
                  <p className="settings-description">
                    You have full permissions to manage products and settings.
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>API Configuration</h3>
                </div>
                <div className="settings-card-content">
                  <p>API Status: <strong className="status-active">Active</strong></p>
                  <p>CORS Enabled: <strong>Yes</strong></p>
                  <p className="settings-description">
                    Your API connection is properly configured.
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Notifications</h3>
                </div>
                <div className="settings-card-content">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable order notifications</span>
                  </label>
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable price change alerts</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Advanced Options</h2>
            <div className="advanced-options">
              <button className="btn-advanced">
                Refresh Cache
              </button>
              <button className="btn-advanced">
                Export Data
              </button>
              <button className="btn-advanced btn-danger">
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}