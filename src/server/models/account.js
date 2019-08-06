/**
 * Created by Dell on 8/10/2018.
 */

const mongoose = require('mongoose');
const registerSchema = mongoose.Schema({
  parent_id: String,
  name: String,
  avatar: String,
  phone: String,
  address: String,
  created_at: Date,
  active: Boolean
});

module.exports = mongoose.model('account', registerSchema, 'account');
