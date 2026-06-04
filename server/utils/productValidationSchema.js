const Joi = require("joi");

const productValidationSchema = Joi.object({
    product: Joi.string()
        .min(2)
        .max(100)
        .required(),
        
    price: Joi.number()
        .min(0)
        .required(),
        
    category: Joi.string()
        .required()
});

module.exports = { productValidationSchema };