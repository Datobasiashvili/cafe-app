const express = require("express");
const router = express.Router();
const {
    getTodaySunbeds,
    updateSunbedStatus,
    resetTodaySunbeds,
    getSunbedStats
} = require("../controllers/sunBedController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.get(
    "/sunbeds",
    authenticate,
    authorize("receptionist", "staff"),
    getTodaySunbeds
);

router.get(
    "/sunbeds/stats",
    authenticate,
    authorize("receptionist", "staff"),
    getSunbedStats
);

router.patch(
    "/sunbeds/:sunbedNumber",
    authenticate,
    authorize("receptionist", "staff"),
    updateSunbedStatus
);

router.post(
    "/sunbeds/reset",
    authenticate,
    authorize("receptionist", "staff"),
    resetTodaySunbeds
);

module.exports = router;
