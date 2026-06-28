const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            subTotal: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    ready: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

const STATS_TIMEZONE = "Asia/Tbilisi";

const buildDateMatch = (dateRange = {}) => {
    const match = {};

    if (dateRange.from || dateRange.to) {
        match.createdAt = {};

        if (dateRange.from) {
            match.createdAt.$gte = dateRange.from;
        }

        if (dateRange.to) {
            match.createdAt.$lt = dateRange.to;
        }
    }

    return Object.keys(match).length ? [{ $match: match }] : [];
};

orderSchema.statics.totalRevenue = async function (dateRange = {}) {
    const result = await this.aggregate([
        ...buildDateMatch(dateRange),
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" }
            }
        }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

orderSchema.statics.totalOrders = function (dateRange = {}) {
    const filter = {};

    if (dateRange.from || dateRange.to) {
        filter.createdAt = {};

        if (dateRange.from) {
            filter.createdAt.$gte = dateRange.from;
        }

        if (dateRange.to) {
            filter.createdAt.$lt = dateRange.to;
        }
    }

    return this.countDocuments(filter);
}

orderSchema.statics.ordersPerDay = async function (dateRange = {}) {
    const result = await this.aggregate([
        ...buildDateMatch(dateRange),
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: STATS_TIMEZONE }
                },
                orders: { $sum: 1 },
                revenue: { $sum: "$totalPrice" }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                orders: 1,
                revenue: 1
            }
        },
        {
            $sort: { date: 1 }
        }
    ]);

    return result;
};

orderSchema.statics.mostPopularItems = async function (dateRange = {}) {
    return await this.aggregate([
        ...buildDateMatch(dateRange),
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" },
                revenue: { $sum: "$items.subTotal" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 } 
    ]);
};

orderSchema.statics.statsForDateRange = async function (dateRange = {}) {
    const [totalRevenue, totalOrders, dailyOrders, mostPopularItems] = await Promise.all([
        this.totalRevenue(dateRange),
        this.totalOrders(dateRange),
        this.ordersPerDay(dateRange),
        this.mostPopularItems(dateRange)
    ]);

    return {
        totalRevenue,
        totalOrders,
        dailyOrders,
        mostPopularItems,
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
    };
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
