const Order = require("../models/Order");

const createOrder = async (req, res) => {
    try {
        const items = req.body.items.map(item => ({
            product: item.product,
            price: item.price,
            quantity: item.quantity,
            subTotal: item.price * item.quantity
        }));
        const totalPrice = items.reduce((sum, item) => sum + item.subTotal, 0);

        const order = await Order.create({ items, totalPrice });
        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const PAGE_SIZE = 10;

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
        const stats = await Order.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$totalPrice" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                total: { $ifNull: ["$total", 0] }
                            }
                        }
                    ],
                    totalOrders: [
                        { $count: "count" }
                    ],
                    dailyOrders: [
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
                        { $sort: { date: 1 } }
                    ],
                    mostPopularItems: [
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
                    ]
                }
            }
        ]);

        const data = stats[0];
        const revenue = data.totalRevenue[0]?.total || 0;
        const totalOrders = data.totalOrders[0]?.count || 0;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: revenue,
                totalOrders,
                dailyOrders: data.dailyOrders,
                mostPopularItems: data.mostPopularItems,
                averageOrderValue: totalOrders > 0 ? (revenue / totalOrders).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch statistics" });
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

module.exports = { createOrder, getOrders, getSingleOrder, getOrderStats, deleteOrder };