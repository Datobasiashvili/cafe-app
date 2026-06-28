import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import Loading from "../components/Loading";
import "../styles/stats.css";

const BRAND = "#e95c2d";
const BRAND2 = "#0891b2";
const BRAND3 = "#d10bb3";
const BRAND4 = "#0bd125";
const BAR_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];
const BAR_COLORS_2 = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fff7ed"];

const formatNumber = (value) => Number(value ?? 0).toLocaleString();
const formatCurrency = (value) => `${formatNumber(value)} ₾`;

// Turns "2026-06-13" → "13 ივნ, 2026" (Georgian)
const GEO_MONTHS = ["იან","თებ","მარ","აპრ","მაი","ივნ","ივლ","აგვ","სექ","ოქტ","ნოე","დეკ"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string" || !DATE_RE.test(dateStr)) return dateStr;
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${GEO_MONTHS[month - 1]}, ${year}`;
};
 

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    from: toDateInputValue(today),
    to: toDateInputValue(tomorrow),
  };
};

function KpiCard({ label, value, sub, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="tt-label">{formatDate(label)}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="tt-value">
          {item.name}:{" "}
          {item.dataKey === "revenue" ? formatCurrency(item.value) : item.value}
        </p>
      ))}
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="custom-tooltip">
      <p className="tt-label">{formatDate(label)}</p>
      <p className="tt-value">
        {item.name}:{" "}
        {item.dataKey === "revenue" ? formatCurrency(item.value) : item.value}
      </p>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [sunbedStats, setSunbedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultRange);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (dateRange.from) params.set("from", dateRange.from);
        if (dateRange.to) params.set("to", dateRange.to);

        const query = params.toString();
        const [orderRes, sunbedRes] = await Promise.all([
          axios.get(`${API_URL}/order/stats${query ? `?${query}` : ""}`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/sunbeds/stats${query ? `?${query}` : ""}`, {
            withCredentials: true,
          }),
        ]);
        setStats(orderRes.data.data);
        setSunbedStats(sunbedRes.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err.response?.data?.message || "სტატისტიკის ჩატვირთვა ვერ მოხერხდა",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL, dateRange]);

  if (loading)
    return (
      <div className="loader-wrap">
        <Loading />
      </div>
    );
  if (!stats)
    return <div className="no-data">მონაცემები არ არის ხელმისაწვდომი.</div>;

  const dailyOrders = stats.dailyOrders ?? [];
  const popularItems = stats.mostPopularItems ?? [];
  const totalOrders = stats.totalOrders ?? 0;
  const totalRevenue = stats.totalRevenue ?? 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const peakOrderDay = dailyOrders.length
    ? dailyOrders.reduce((a, b) => (b.orders > a.orders ? b : a))
    : null;

  const dailySunbedUsage = sunbedStats?.dailyUsage ?? [];
  const mostUsedBeds = sunbedStats?.mostUsedBeds ?? [];
  const sunbedTotalUses = sunbedStats?.totalUses ?? 0;
  const sunbedUniqueBeds = sunbedStats?.usedBeds ?? 0;
  const sunbedRevenue = sunbedStats?.totalRevenue ?? 0;
  const sunbedAveragePrice = sunbedStats?.averagePrice ?? 0;
  const peakSunbedUsageDay = sunbedStats?.peakUsageDay ?? null;
  const peakSunbedRevenueDay = sunbedStats?.peakRevenueDay ?? null;

  const rangeLabel =
    dateRange.from && dateRange.to
      ? `${dateRange.from} - ${dateRange.to}`
      : dateRange.from
        ? `${dateRange.from}-დან`
        : dateRange.to
          ? `${dateRange.to}-მდე`
          : "ყველა პერიოდი";

  const showToday = () => setDateRange(getDefaultRange());
  const showAllTime = () => setDateRange({ from: "", to: "" });
  const updateDateRange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="stats-root">
      <header className="stats-header">
        <div>
          <h1 className="stats-title">ანალიტიკა</h1>
          <p className="stats-subtitle">
            შეკვეთებისა და შეზლონგების სტატისტიკა
          </p>
        </div>

        <div className="stats-date-filter">
          <label className="stats-date-field">
            <span>დან</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => updateDateRange("from", e.target.value)}
            />
          </label>
          <label className="stats-date-field">
            <span>მდე</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => updateDateRange("to", e.target.value)}
            />
          </label>
          <div className="stats-date-actions">
            <button type="button" onClick={showToday}>
              დღეს
            </button>
            <button type="button" onClick={showAllTime}>
              სულ
            </button>
          </div>
        </div>
      </header>

      {error && <p className="stats-error">{error}</p>}

      <section className="kpi-grid">
        <KpiCard
          icon="₾"
          label="შეკვეთების შემოსავალი"
          value={formatNumber(totalRevenue)}
          sub={rangeLabel}
        />
        <KpiCard
          icon="#"
          label="შეკვეთები"
          value={totalOrders.toLocaleString()}
          sub={rangeLabel}
        />
        {peakOrderDay && (
          <KpiCard
            icon="▲"
            label="პიკის დღე"
            value={formatNumber(peakOrderDay.orders)}
            sub={peakOrderDay.date}
          />
        )}
        {peakOrderDay && (
          <KpiCard
            icon="▲"
            label="პიკი დღის შემოსავალი"
            value={formatNumber(peakOrderDay.revenue)}
            sub={peakOrderDay.date}
          />
        )}
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-title">ყოველდღიური შეკვეთები</h2>
            <span className="chart-badge">{dailyOrders.length} დღე</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={dailyOrders}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>

                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND2} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--grid)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomAreaTooltip />}
                cursor={{
                  stroke: "var(--brand)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                name="შეკვეთები"
                type="monotone"
                dataKey="orders"
                stroke={BRAND}
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: BRAND, strokeWidth: 0 }}
              />
              <Area
                name="შემოსავალი"
                type="monotone"
                dataKey="revenue"
                stroke={BRAND2}
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: BRAND2, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-title">ტოპ 5 პროდუქტი</h2>
            <span className="chart-badge">გაყიდული ერთეულებით</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={popularItems}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                stroke="var(--grid)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="_id"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "var(--bar-hover)" }}
              />
              <Bar name="გაყიდული" dataKey="totalSold" radius={[6, 6, 0, 0]}>
                {popularItems.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i] ?? "#e0e7ff"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ol className="product-rank">
            {popularItems.map((item, i) => (
              <li key={i} className="rank-row">
                <span
                  className="rank-dot"
                  style={{ background: BAR_COLORS[i] }}
                />
                <span className="rank-name">{item._id}</span>
                <span className="rank-count">{item.totalSold} ერთეული</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="kpi-grid sunbed-kpi-grid">
        <KpiCard
          icon="₾"
          label="შეზლონგების შემოსავალი"
          value={formatNumber(sunbedRevenue)}
          sub={rangeLabel}
        />
        <KpiCard
          icon="#"
          label="დაკავებები"
          value={sunbedTotalUses.toLocaleString()}
          sub={`${sunbedUniqueBeds.toLocaleString()} უნიკალური შეზლონგი`}
        />
        {peakSunbedUsageDay && (
          <KpiCard
            icon="▲"
            label="პიკის დღე"
            value={formatNumber(peakSunbedUsageDay.usedBeds)}
            sub={peakSunbedUsageDay.date}
          />
        )}
        {peakSunbedRevenueDay && (
          <KpiCard
            icon="▲"
            label="პიკის დღის თანხა"
            value={formatNumber(peakSunbedRevenueDay.revenue)}
            sub={peakSunbedRevenueDay.date}
          />
        )}
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-title">შეზლონგების ყოველდღიური დაკავება</h2>
            <span className="chart-badge">{dailySunbedUsage.length} დღე</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={dailySunbedUsage}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sunbedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND3} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND3} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--grid)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomAreaTooltip />}
                cursor={{
                  stroke: BRAND3,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                name="დაკავებები"
                type="monotone"
                dataKey="usedBeds"
                stroke={BRAND3}
                strokeWidth={2.5}
                fill="url(#sunbedAreaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: BRAND2, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-title">შეზლონგების ყოველდღიური შემოსავალი</h2>
            <span className="chart-badge">სულ: {formatCurrency(sunbedRevenue)}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={dailySunbedUsage}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="sunbedRevenueGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={BRAND4} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={BRAND4} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--grid)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomAreaTooltip />}
                cursor={{
                  stroke: BRAND4,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                name="შემოსავალი"
                type="monotone"
                dataKey="revenue"
                stroke={BRAND4}
                strokeWidth={2.5}
                fill="url(#sunbedRevenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: BRAND4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-title">ტოპ შეზლონგები</h2>
            <span className="chart-badge">დაკავებების მიხედვით</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={mostUsedBeds}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                stroke="var(--grid)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="_id"
                tickFormatter={(v) => `#${v}`}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "var(--bar-hover)" }}
              />
              <Bar name="დაკავებები" dataKey="uses" radius={[6, 6, 0, 0]}>
                {mostUsedBeds.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS_2[i] ?? "#e0e7ff"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}