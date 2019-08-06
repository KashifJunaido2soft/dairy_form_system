/**
 * Created by Dell on 8/10/2018.
 */

const mongoose = require('mongoose');
const adminConfigSchema = mongoose.Schema({
  parent_id: String,
  lang: String,
  price: String
});

module.exports = mongoose.model('admin_config', adminConfigSchema, 'admin_config');
