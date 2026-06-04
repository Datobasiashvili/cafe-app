const express = require("express");
const router = express.Router();
const { validateProduct } = require("../middlewares/validateProduct");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { addProduct, getProducts, updateProduct, deleteProduct, getProductStats } = require("../controllers/productController");


router.post("/product",
    authenticate,
    authorize("receptionist", "staff"),
    validateProduct,
    addProduct
);

router.get("/product/stats",
    authenticate,
    authorize("receptionist", "staff"),
    getProductStats
);

router.get("/product",
    authenticate,
    authorize("receptionist", "staff"),
    getProducts
);

router.patch("/product/:id",
    authenticate,
    authorize("receptionist"),
    updateProduct
);

router.delete("/product/:id",
    authenticate,
    authorize("receptionist"),
    deleteProduct
);

module.exports = router;