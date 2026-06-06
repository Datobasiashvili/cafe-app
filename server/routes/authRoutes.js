const express = require("express");
const router = express.Router();
const  { login, checkMe, logout } = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateAuth } = require("../middlewares/validateAuth");

router.post("/auth/login", validateAuth, login);

router.get("/auth/check-me", authenticate, checkMe);

router.post("/auth/logout", logout);

module.exports = router;
