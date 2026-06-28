const Joi = require("joi");

const orderValidationSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().trim().min(1).required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
        subTotal: Joi.number().min(0)
      })
    )
    .min(1) 
    .required()
});

module.exports = orderValidationSchema;
