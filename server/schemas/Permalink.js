const mongoose = require('mongoose');

const PermalinkSchema = new mongoose.Schema({
  permalink: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Permalink', PermalinkSchema);
