import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PoolArea from "../components/Pool-layout/PoolArea";
import StatsBar from "../components/Pool-layout/StatsBar";
import Loading from "../components/Loading";
import { getSunbedPriceOptions } from "../config/sunbedPrices";
import "../styles/pool.css";

const LAYOUT = {
  grass:  Array.from({ length: 3  }, (_, i) => ({ id: i + 1,  status: "available" })),
  top:    Array.from({ length: 8  }, (_, i) => ({ id: i + 4,  status: "available" })),
  left:   Array.from({ length: 8  }, (_, i) => ({ id: i + 12, status: "available" })),
  right:  Array.from({ length: 9  }, (_, i) => ({ id: i + 20, status: "available" })),
  bottom: Array.from({ length: 12 }, (_, i) => ({ id: i + 29, status: "available" })),
  extra:  Array.from({ length: 12 }, (_, i) => ({ id: i + 41, status: "available" })),
};

function flattenLayout(layout) {
  return Object.values(layout).flat();
}

function applyBedStatus(layout, id, status) {
  const updated = {};
  for (const [key, beds] of Object.entries(layout)) {
    updated[key] = beds.map((bed) => (bed.id === id ? { ...bed, status } : bed));
  }
  return updated;
}

function applyReset(layout) {
  const updated = {};
  for (const [key, beds] of Object.entries(layout)) {
    updated[key] = beds.map((bed) => ({ ...bed, status: "available" }));
  }
  return updated;
}

export default function Pool() {
  const [layout, setLayout] = useState(LAYOUT);
  const [loading, setLoading] = useState(true);
  const [savingBed, setSavingBed] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const applyServerSunbeds = useCallback((sunbeds) => {
    const statusByNumber = sunbeds.reduce((acc, bed) => {
      acc[bed.sunbedNumber] = bed.status;
      return acc;
    }, {});

    setLayout((prev) => {
      const updated = {};
      for (const [key, beds] of Object.entries(prev)) {
        updated[key] = beds.map((bed) => ({
          ...bed,
          status: statusByNumber[bed.id] || "available",
        }));
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const fetchSunbeds = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_URL}/sunbeds`, { withCredentials: true });
        applyServerSunbeds(response.data.sunbeds || []);
      } catch (err) {
        console.error("Error fetching sunbeds:", err);
        setError(err.response?.data?.message || "Error fetching sunbeds");
      } finally {
        setLoading(false);
      }
    };

    fetchSunbeds();
  }, [API_URL, applyServerSunbeds]);

  const openBedModal = (id) => {
    const currentBed = flattenLayout(layout).find((bed) => bed.id === id);
    if (!currentBed || savingBed) return;
    setSelectedBed(currentBed);
  };

  const saveBedStatus = async (status, price) => {
    if (!selectedBed || savingBed) return;

    const id = selectedBed.id;
    const previousLayout = layout;

    setError("");
    setSavingBed(id);
    setSelectedBed(null);
    setLayout((prev) => applyBedStatus(prev, id, status));

    try {
      await axios.patch(
        `${API_URL}/sunbeds/${id}`,
        { status, price },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error updating sunbed:", err);
      setLayout(previousLayout);
      setError(err.response?.data?.message || "Error updating sunbed");
    } finally {
      setSavingBed(null);
    }
  };

  const resetAll = async () => {
    const shouldReset = window.confirm(
      "ყველა შეზლონგი გავათავისუფლოთ? დღევანდელი დაკავებული შეზლონგები სტატისტიკაში დარჩება."
    );
    if (!shouldReset) return;

    const previousLayout = layout;

    setError("");
    setSavingBed("reset");
    setLayout((prev) => applyReset(prev));

    try {
      await axios.post(`${API_URL}/sunbeds/reset`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Error resetting sunbeds:", err);
      setLayout(previousLayout);
      setError(err.response?.data?.message || "Error resetting sunbeds");
    } finally {
      setSavingBed(null);
    }
  };

  const allBeds = flattenLayout(layout);
  const takenCount = allBeds.filter((bed) => bed.status === "occupied").length;
  const reservedCount = allBeds.filter((bed) => bed.status === "reserved").length;
  const freeCount = allBeds.length - takenCount - reservedCount;

  if (loading) return <div className="pool-loader"><Loading /></div>;

  return (
    <div className="pool">
      <h1 className="pool-title">აუზის შეზლონგები</h1>
      {error && <p className="pool-error">{error}</p>}
      <StatsBar total={allBeds.length} taken={takenCount} reserved={reservedCount} free={freeCount} />
      <PoolArea layout={layout} onToggle={openBedModal} />
      <button
        type="button"
        className="reset-btn"
        onClick={resetAll}
        disabled={Boolean(savingBed)}
      >
        დღის დასრულება: ყველა შეზლონგის გათავისუფლება
      </button>

      {selectedBed && (
        <div className="sunbed-modal-overlay" onClick={() => setSelectedBed(null)}>
          <div className="sunbed-modal" onClick={(e) => e.stopPropagation()}>

            {/* X button */}
            <button
              type="button"
              className="sunbed-modal-cancel"
              onClick={() => setSelectedBed(null)}
              aria-label="დახურვა"
            >
              ✕
            </button>

            <h2>შეზლონგი #{selectedBed.id}</h2>
            <p>აირჩიეთ სტატუსი. დაკავებისას მიუთითეთ ფასი.</p>

            <div className="sunbed-price-grid">
              {getSunbedPriceOptions().map((option) => (
                <button
                  key={`${option.label}-${option.amount}`}
                  type="button"
                  className="sunbed-price-btn"
                  onClick={() => saveBedStatus("occupied", option.amount)}
                  disabled={selectedBed.status === "occupied"}
                >
                  <span>{option.label}</span>
                  <strong>{option.amount} ₾</strong>
                </button>
              ))}
            </div>

            <div className="sunbed-modal-actions">
              <button
                type="button"
                className="sunbed-modal-btn reserve"
                onClick={() => saveBedStatus("reserved")}
                disabled={selectedBed.status === "reserved"}
              >
                დაჯავშნა
              </button>
              <button
                type="button"
                className="sunbed-modal-btn free"
                onClick={() => saveBedStatus("available")}
                disabled={selectedBed.status === "available"}
              >
                გათავისუფლება
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}