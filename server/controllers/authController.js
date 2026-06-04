const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "14d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 14 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: "Login successful" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const checkMe = async (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user 
  });
};

const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), 
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { login, checkMe, logout };

