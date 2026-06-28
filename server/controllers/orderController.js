const Order = require("../models/Order");

const createOrder = async (req, res) => {
    try {
        const items = req.body.items.map(item => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            if (!item.product || !Number.isFinite(price) || !Number.isInteger(quantity) || price < 0 || quantity < 1) {
                throw new Error("Invalid order item");
            }

            return {
                product: item.product.trim(),
                price,
                quantity,
                subTotal: price * quantity
            };
        });
        const totalPrice = items.reduce((sum, item) => sum + item.subTotal, 0);

        const order = await Order.create({ items, totalPrice });
        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Order Create Error:", error);
        res.status(400).json({ message: "Invalid order data" });
    }
}

const PAGE_SIZE = 10;
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

const getOrders = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const skip = (page - 1) * PAGE_SIZE;

        const [orders, totalResult] = await Promise.all([
            Order.aggregate([
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: PAGE_SIZE },
                {
                    $project: {
                        _id: 1,
                        items: 1,
                        totalPrice: 1,
                        createdAt: 1,
                        ready: 1,
                        itemCount: { $size: "$items" }
                    }
                }
            ]),
            Order.aggregate([
                { $count: "total" }
            ])
        ]);

        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders,
            pagination: {
                total,
                page,
                pageSize: PAGE_SIZE,
                hasMore: skip + orders.length < total
            }
        });
    } catch (error) {
        console.error("Order Fetch Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order with given ID was not found"
            });
        }

        res.status(200).json({
            message: "Order with the given id retrieved successfully",
            order
        });
    } catch (error) {
        console.error("Order Fetch Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getOrderStats = async (req, res) => {
    try {
        const dateRange = parseStatsDateRange(req.query);
        const data = await Order.statsForDateRange(dateRange);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Stats Error:", error);
        const isDateError = error.message?.startsWith("Invalid") || error.message?.startsWith("Date range");
        res.status(isDateError ? 400 : 500).json({
            message: isDateError ? error.message : "Failed to fetch statistics"
        });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({
                message: "Order with given ID was not found"
            });
        }

        res.status(200).json({
            message: "Order was deleted successfully"
        });
    } catch (error) {
        console.error("Order Deleting Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { ready } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID format"
            });
        }

        if (typeof ready !== 'boolean') {
            return res.status(400).json({
                message: "Invalid payload. 'ready' must be a boolean"
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { ready },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order with given ID was not found"
            });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error("Order Status Update Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { createOrder, getOrders, getSingleOrder, getOrderStats, deleteOrder, updateOrderStatus };
