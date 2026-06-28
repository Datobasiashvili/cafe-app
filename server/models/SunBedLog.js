const mongoose = require("mongoose");

const sunbedLogSchema = new mongoose.Schema({
  sunbedNumber: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["occupied", "reserved", "available"], 
    required: true 
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

sunbedLogSchema.index({ timestamp: -1, sunbedNumber: 1 });

const STATS_TIMEZONE = "Asia/Tbilisi";

const buildDateMatch = (dateRange = {}) => {
  const match = {};

  if (dateRange.from || dateRange.to) {
    match.timestamp = {};

    if (dateRange.from) {
      match.timestamp.$gte = dateRange.from;
    }

    if (dateRange.to) {
      match.timestamp.$lt = dateRange.to;
    }
  }

  return Object.keys(match).length ? [{ $match: match }] : [];
};

sunbedLogSchema.statics.latestStatusByBed = async function (dateRange = {}) {
  return this.aggregate([
    ...buildDateMatch(dateRange),
    { $sort: { sunbedNumber: 1, timestamp: -1 } },
    {
      $group: {
        _id: "$sunbedNumber",
        sunbedNumber: { $first: "$sunbedNumber" },
        status: { $first: "$status" },
        timestamp: { $first: "$timestamp" }
      }
    },
    { $sort: { sunbedNumber: 1 } }
  ]);
};

sunbedLogSchema.statics.usedBedsCount = async function (dateRange = {}) {
  const result = await this.aggregate([
    ...buildDateMatch(dateRange),
    { $match: { status: "occupied" } },
    { $group: { _id: "$sunbedNumber" } },
    { $count: "total" }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

sunbedLogSchema.statics.usagePerDay = async function (dateRange = {}) {
  return this.aggregate([
    ...buildDateMatch(dateRange),
    { $match: { status: "occupied" } },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
              timezone: STATS_TIMEZONE
            }
          },
          sunbedNumber: "$sunbedNumber"
        },
        revenue: { $sum: { $ifNull: ["$price", 0] } }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        usedBeds: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$revenue", 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        usedBeds: 1,
        revenue: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
};

sunbedLogSchema.statics.mostUsedBeds = async function (dateRange = {}) {
  return this.aggregate([
    ...buildDateMatch(dateRange),
    { $match: { status: "occupied" } },
    {
      $group: {
        _id: "$sunbedNumber",
        uses: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$price", 0] } }
      }
    },
    { $sort: { uses: -1, _id: 1 } },
    { $limit: 5 }
  ]);
};

sunbedLogSchema.statics.statsForDateRange = async function (dateRange = {}) {
  const [usedBeds, dailyUsage, mostUsedBeds] = await Promise.all([
    this.usedBedsCount(dateRange),
    this.usagePerDay(dateRange),
    this.mostUsedBeds(dateRange)
  ]);
  const totalRevenue = dailyUsage.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalUses = dailyUsage.reduce((sum, day) => sum + (day.usedBeds || 0), 0);
  const peakUsageDay = dailyUsage.length
    ? dailyUsage.reduce((a, b) => (b.usedBeds > a.usedBeds ? b : a))
    : null;
  const peakRevenueDay = dailyUsage.length
    ? dailyUsage.reduce((a, b) => (b.revenue > a.revenue ? b : a))
    : null;

  return {
    usedBeds,
    totalUses,
    totalRevenue,
    averagePrice: totalUses > 0 ? totalRevenue / totalUses : 0,
    peakUsageDay,
    peakRevenueDay,
    dailyUsage,
    mostUsedBeds
  };
};

module.exports = mongoose.model("SunbedLog", sunbedLogSchema);
