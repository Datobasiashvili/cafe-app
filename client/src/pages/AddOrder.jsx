import { useState, useEffect } from "react";
import axios from "axios";
import PrintPreview from "../components/PrintPreview";
import "../styles/addOrder.css";

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/product`, { withCredentials: true });
        if (response.status === 200) setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products", err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [API_URL]);

  const grouped = products.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const addToCart = (product, price) => {
    setCart((prev) => ({
      ...prev,
      [product]: { price, quantity: (prev[product]?.quantity || 0) + 1 },
    }));
  };

  const adjustCart = (e, product, delta) => {
    e.stopPropagation();
    setCart((prev) => {
      const current = prev[product]?.quantity || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [product]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product]: { ...prev[product], quantity: next } };
    });
  };

  const handleSaveOrder = async () => {
    if (saving) return;

    const items = Object.entries(cart).map(([product, { price, quantity }]) => ({
      product,
      price: Number(price),
      quantity: Number(quantity),
    }));

    if (items.length === 0) {
      setError("გთხოვთ დაამატოთ ერთი პროდუქტი მაინც");
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await axios.post(`${API_URL}/order`, { items }, { withCredentials: true });
      if (response.status === 201) {
        setOrderToPrint(response.data.order || { items });
        setShowPrintPreview(true);
        setCart({});
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error while saving order");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const catColors = [
    '#7c3aed', // სალათები   — violet
    '#0369a1', // პიცა        — blue
    '#b45309', // ხაჭაპური    — amber
    '#0f766e', // სნექები     — teal
    '#be185d', // ბრუსკეტი   — pink
    '#9333ea', // დესერტი     — purple
    '#0369a1', // უალკოჰოლო  — blue
    '#b45309', // ყავა        — amber
    '#0f766e', // ალკოჰოლური — teal
  ];

  const cartEntries = Object.entries(cart);
  const totalPrice = cartEntries.reduce((sum, [, { price, quantity }]) => sum + price * quantity, 0);

  return (
    <div className="ao-layout">
      {error && <p className="ao-error">{error}</p>}
      {showPrintPreview && orderToPrint && (
        <PrintPreview order={orderToPrint} onClose={() => setShowPrintPreview(false)} />
      )}

      <div className="ao-left">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="ao-category">
            <p
              className="ao-cat-label"
              style={{ color: catColors[Object.keys(grouped).indexOf(category)] }}
            >
              {category}
            </p>
            <div className="ao-grid">
              {items.map(({ product, price }) => {
                const cartItem = cart[product];
                const isSelected = !!cartItem;
                return (
                  <div
                    key={product}
                    className={`ao-card ${isSelected ? "selected" : ""}`}
                    onClick={() => addToCart(product, price)}
                  >
                    {isSelected && (
                      <button
                        className="ao-rm"
                        onClick={(e) => adjustCart(e, product, -1)}
                        aria-label={`Remove one ${product}`}
                      >✕</button>
                    )}
                    <span className="ao-card-name">{product}</span>
                    <span className="ao-card-price">₾ {price}</span>
                    {isSelected && (
                      <div className="ao-card-sel">
                        <span className="ao-card-qty">რაოდ: {cartItem.quantity}</span>
                        <span className="ao-card-sub">₾ {price * cartItem.quantity}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT — order panel */}
      <div className="ao-panel">
        <div className="ao-panel-head">
          <span className="ao-panel-title">მიმდინარე შეკვეთა</span>
        </div>

        <div className="ao-panel-body">
          {cartEntries.length === 0 ? (
            <p className="ao-panel-empty">პროდუქტი არ არის დამატებული</p>
          ) : (
            cartEntries.map(([product, { price, quantity }]) => (
              <div key={product} className="ao-order-row">
                <span className="ao-or-name">{product}</span>
                <div className="ao-or-qty">
                  <button className="ao-qty-btn" onClick={(e) => adjustCart(e, product, -1)}>−</button>
                  <span className="ao-qty-num">{quantity}</span>
                  <button className="ao-qty-btn" onClick={(e) => adjustCart(e, product, 1)}>+</button>
                </div>
                <span className="ao-or-sub">₾ {price * quantity}</span>
              </div>
            ))
          )}
        </div>

        <div className="ao-panel-footer">
          <div className="ao-total-row">
            <span className="ao-total-label">სულ</span>
            <span className="ao-total-val">₾ {totalPrice}</span>
          </div>
          <div className="ao-footer-btns">
            <button className="ao-btn" onClick={() => setCart({})}>გადატვირთვა</button>
            <button className="ao-btn primary" onClick={handleSaveOrder} disabled={saving}>
              {saving ? "Saving..." : "შენახვა"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
