const orderValidationSchema = require("../utils/orderValidationSchema");

const validateOrder = (req, res, next) => {
  const { error } = orderValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next(); 
};

module.exports = validateOrder;