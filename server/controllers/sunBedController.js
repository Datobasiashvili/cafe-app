const Sunbed = require("../models/Sunbed");
const SunbedLog = require("../models/SunBedLog");

const TOTAL_SUNBEDS = 40;
const STATS_TIMEZONE_OFFSET = "+04:00";

const parseStatsDateRange = ({ from, to }) => {
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    const dateRange = {};

    if (from) {
        if (!dateOnlyPattern.test(from)) {
            throw new Error("Invalid from date");
        }

        dateRange.from = new Date(`${from}T00:00:00.000${STATS_TIMEZONE_OFFSET}`);
    }

    if (to) {
        if (!dateOnlyPattern.test(to)) {
            throw new Error("Invalid to date");
        }

        dateRange.to = new Date(`${to}T00:00:00.000${STATS_TIMEZONE_OFFSET}`);
    }

    if (dateRange.from && dateRange.to && dateRange.from >= dateRange.to) {
        throw new Error("Date range end must be after start");
    }

    return dateRange;
};

const todayDateRange = () => {
    const now = new Date();
    const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tbilisi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);

    const from = new Date(`${date}T00:00:00.000${STATS_TIMEZONE_OFFSET}`);
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 1);

    return { from, to };
};

const isValidSunbedNumber = (sunbedNumber) => {
    return Number.isInteger(sunbedNumber) && sunbedNumber >= 1 && sunbedNumber <= TOTAL_SUNBEDS;
};

const normalizeStatus = (status) => {
    if (status === "booked") return "reserved";
    return status;
};

const normalizeSunbedPrice = (status, price) => {
    if (status !== "occupied") return 0;

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        throw new Error("Invalid sunbed price");
    }

    return numericPrice;
};

const buildDefaultSunbeds = () => {
    return Array.from({ length: TOTAL_SUNBEDS }, (_, index) => ({
        sunbedNumber: index + 1,
        status: "available"
    }));
};

const ensureSunbeds = async () => {
    await Sunbed.bulkWrite(
        buildDefaultSunbeds().map((sunbed) => ({
            updateOne: {
                filter: { sunbedNumber: sunbed.sunbedNumber },
                update: { $setOnInsert: sunbed },
                upsert: true
            }
        }))
    );
};

const getTodaySunbeds = async (req, res) => {
    try {
        await ensureSunbeds();

        const sunbeds = await Sunbed.find({})
            .sort({ sunbedNumber: 1 })
            .select("sunbedNumber status updatedAt");

        const occupied = sunbeds.filter((bed) => bed.status === "occupied").length;
        const reserved = sunbeds.filter((bed) => bed.status === "reserved").length;

        res.status(200).json({
            message: "Sunbeds retrieved successfully",
            sunbeds,
            stats: {
                total: TOTAL_SUNBEDS,
                occupied,
                reserved,
                available: TOTAL_SUNBEDS - occupied - reserved
            }
        });
    } catch (error) {
        console.error("Sunbed Fetch Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateSunbedStatus = async (req, res) => {
    try {
        const sunbedNumber = Number(req.params.sunbedNumber);
        const status = normalizeStatus(req.body.status);
        const price = normalizeSunbedPrice(status, req.body.price);

        if (!isValidSunbedNumber(sunbedNumber)) {
            return res.status(400).json({ message: "Invalid sunbed number" });
        }

        if (!["occupied", "reserved", "available"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const sunbed = await Sunbed.findOneAndUpdate(
            { sunbedNumber },
            { status },
            { new: true, upsert: true, runValidators: true }
        );
        const sunbedLog = await SunbedLog.create({ sunbedNumber, status, price });

        res.status(201).json({
            message: "Sunbed status saved successfully",
            sunbed,
            sunbedLog
        });
    } catch (error) {
        console.error("Sunbed Update Error:", error);
        res.status(400).json({ message: "Invalid sunbed data" });
    }
};

const resetTodaySunbeds = async (req, res) => {
    try {
        await ensureSunbeds();

        const bedsToReset = await Sunbed.find({ status: { $ne: "available" } });
        const logs = bedsToReset.length
            ? await SunbedLog.insertMany(
                bedsToReset.map((log) => ({
                    sunbedNumber: log.sunbedNumber,
                    status: "available"
                }))
            )
            : [];

        await Sunbed.updateMany({}, { status: "available" });

        res.status(201).json({
            message: "All sunbeds reset successfully",
            logsCreated: logs.length
        });
    } catch (error) {
        console.error("Sunbed Reset Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getSunbedStats = async (req, res) => {
    try {
        const dateRange = parseStatsDateRange(req.query);
        const data = await SunbedLog.statsForDateRange(dateRange);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Sunbed Stats Error:", error);
        const isDateError = error.message?.startsWith("Invalid") || error.message?.startsWith("Date range");
        res.status(isDateError ? 400 : 500).json({
            message: isDateError ? error.message : "Failed to fetch sunbed statistics"
        });
    }
};

module.exports = {
    getTodaySunbeds,
    updateSunbedStatus,
    resetTodaySunbeds,
    getSunbedStats
};
