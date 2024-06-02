const mongoose = require('mongoose');
const LinkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  unique_permalink: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  preview_url: String,
  description: String,
  price: { type: Number, required: true, default: 1.00 },
  create_date: { type: Date, default: Date.now },
  number_of_views: { type: Number, default: 0 },
  number_of_downloads: { type: Number, default: 0 },
  balance: { type: Number, default: 0.00 },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

module.exports = mongoose.model('Link', LinkSchema);