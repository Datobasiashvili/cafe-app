const Joi = require("joi");

const orderValidationSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
        subTotal: Joi.number().min(0)
      })
    )
    .min(1) 
    .required()
});

module.exports = orderValidationSchema;