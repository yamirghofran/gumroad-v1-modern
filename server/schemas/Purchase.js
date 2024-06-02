const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  purchase_date: { type: Date, default: Date.now },
  amount: { type: Number, required: true }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
