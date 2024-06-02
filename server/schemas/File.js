const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  unique_permalink: { type: String, required: true },
  file_name: { type: String, required: true },
  file_type: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', FileSchema);
