const { productValidationSchema } = require("../utils/productValidationSchema");

const validateProduct = (req, res, next) => {
    const { error } = productValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        // Collect all error messages into an array
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg);
    }
    
    next();
};

module.exports = { validateProduct };