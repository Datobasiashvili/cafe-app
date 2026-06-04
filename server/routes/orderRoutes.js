const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getSingleOrder, getOrderStats, deleteOrder } = require("../controllers/orderController");
const validateOrder = require("../middlewares/validateOrder");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.post("/order",
    authenticate,
    authorize("receptionist", "staff"),
    validateOrder,
    createOrder
);

router.get("/order",
    authenticate,
    authorize("receptionist", "staff"),
    getOrders
);

router.get(
    "/order/stats",
    authenticate,
    authorize("receptionist", "staff"),
    getOrderStats
);

router.get("/order/:id",
    authenticate,
    authorize("receptionist", "staff"),
    getSingleOrder
);

router.delete("/order/:id",
    authenticate,
    authorize("receptionist"),
    deleteOrder
);


module.exports = router;

