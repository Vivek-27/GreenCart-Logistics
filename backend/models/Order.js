const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  valueRs: { type: Number, required: true },
  assignedRoute: { type: String, required: true }, // routeId
  deliveryTimestamp: { type: String, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);
