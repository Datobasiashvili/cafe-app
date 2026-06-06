const { loginValidationSchema } = require("../utils/authValidationSchema");

const validateAuth = (req, res, next) => {
    const { error } = loginValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        return res.status(400).json({ message: msg });
    }

    next();
};

module.exports = { validateAuth };
