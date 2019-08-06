/**
 * Created by Dell on 8/10/2018.
 */

const mongoose = require('mongoose');
const registerSchema = mongoose.Schema({
  parent_id: String,
  name: String,
  avatar: String,
  price: String,
  location: String,
  phone: String,
  password: String,
  notes: String,
  address: String,
  created_at: Date,
  starred: Boolean,
  active: Boolean
});

module.exports = mongoose.model('admin', registerSchema, 'admin');
