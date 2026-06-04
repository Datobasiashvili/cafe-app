const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["receptionist", "staff"],
        required: true,
    }
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;