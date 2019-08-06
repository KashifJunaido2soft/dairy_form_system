/**
 * Created by Dell on 8/10/2018.
 */

const mongoose = require('mongoose');
const purchaseSchema = mongoose.Schema({
  parent_id: String,
  userId: String,
  account_id: Object,
  item_type: String,
  price: String,
  quantity: String,
  total_price: String,
  location: String,
  invoice_no: String,
  date: String,
  created_at: Date
});

module.exports = mongoose.model('purchase', purchaseSchema, 'purchase');
