const mongoose = require("mongoose");

const sunbedSchema = new mongoose.Schema(
  {
    sunbedNumber: {
      type: Number,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["occupied", "reserved", "available"],
      default: "available",
      required: true
    }
  },
  { timestamps: true }
);

sunbedSchema.index({ sunbedNumber: 1 }, { unique: true });

module.exports = mongoose.model("Sunbed", sunbedSchema);
