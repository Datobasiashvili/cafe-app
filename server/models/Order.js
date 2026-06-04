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
    }
},
    { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

// Kept for backward compatibility - use aggregation in controller for better performance
orderSchema.statics.totalRevenue = async function () {
    const result = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" }
            }
        }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

orderSchema.statics.totalOrders = function () {
    return this.countDocuments();
}

orderSchema.statics.ordersPerDay = async function () {
    const result = await this.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                orders: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                orders: 1
            }
        },
        {
            $sort: { date: 1 }
        }
    ]);

    return result;
};

orderSchema.statics.mostPopularItems = async function () {
    return await this.aggregate([
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 } 
    ]);
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;