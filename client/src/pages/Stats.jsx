import { useEffect, useState } from "react";
import axios from "axios";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";
import Loading from "../components/Loading";
import "../styles/stats.css";

const BRAND = "#e95c2d";
const BRAND2 = "#22d3ee";
const BAR_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

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
            <p className="tt-label">{label}</p>
            <p className="tt-value">{payload[0].value} შეკვეთა</p>
        </div>
    );
}

function CustomBarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <p className="tt-label">{label}</p>
            <p className="tt-value">{payload[0].value} გაყიდული</p>
        </div>
    );
}

export default function Stats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/order/stats`, { withCredentials: true });
                setStats(res.data.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [API_URL]);

    if (loading) return <div className="loader-wrap"><Loading /></div>;
    if (!stats) return <div className="no-data">მონაცემი არ არის ხელმისაწვდომი.</div>;

    const dailyOrders = stats.dailyOrders ?? [];
    const popularItems = stats.mostPopularItems ?? [];
    const totalOrders = stats.totalOrders ?? 0;
    const totalRevenue = stats.totalRevenue ?? 0;
    const avgOrderValue = totalOrders > 0
        ? (totalRevenue / totalOrders).toFixed(2)
        : "0.00";
    const peakDay = dailyOrders.length
        ? dailyOrders.reduce((a, b) => (b.orders > a.orders ? b : a))
        : null;

    return (
        <div className="stats-root">

            <header className="stats-header">
                <div>
                    <h1 className="stats-title">ანალიტიკა</h1>
                    <p className="stats-subtitle">ბიზნესის ფუნქციონირების მიმოხილვა</p>
                </div>
            </header>

            <section className="kpi-grid">
                <KpiCard
                    icon="₾"
                    label="მთლიანი შემოსავალი"
                    value={`₾ ${totalRevenue.toLocaleString()}`}
                    sub="ყველა დროში"
                />
                <KpiCard
                    icon="#"
                    label="მთლიანი შეკვეთები"
                    value={totalOrders.toLocaleString()}
                    sub="ყველა დროში"
                />
                <KpiCard
                    icon="⌀"
                    label="საშ. შეკვეთის ღირებულება"
                    value={`₾ ${Number(avgOrderValue).toLocaleString()}`}
                    sub="შემოსავალი ÷ შეკვეთებზე"
                />
                {peakDay && (
                    <KpiCard
                        icon="▲"
                        label="პიკის დღე"
                        value={peakDay.orders}
                        sub={peakDay.date}
                    />
                )}
            </section>

            <section className="charts-grid">

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h2 className="chart-title">ყოველდღიური შეკვეთების რაოდენობა</h2>
                        <span className="chart-badge">{dailyOrders.length} დღე</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={dailyOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: "var(--brand)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                            <Area type="monotone" dataKey="orders" stroke={BRAND} strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: BRAND, strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h2 className="chart-title">ტოპ 5 პროდუქტი</h2>
                        <span className="chart-badge">გაყიდული ერთეულების რაოდენობით</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={popularItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
                            <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="_id" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "var(--bar-hover)" }} />
                            <Bar dataKey="totalSold" radius={[6, 6, 0, 0]}>
                                {popularItems.map((_, i) => (
                                    <Cell key={i} fill={BAR_COLORS[i] ?? "#e0e7ff"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <ol className="product-rank">
                        {popularItems.map((item, i) => (
                            <li key={i} className="rank-row">
                                <span className="rank-dot" style={{ background: BAR_COLORS[i] }} />
                                <span className="rank-name">{item._id}</span>
                                <span className="rank-count">{item.totalSold} ერთეული</span>
                            </li>
                        ))}
                    </ol>
                </div>

            </section>
        </div>
    );
}
