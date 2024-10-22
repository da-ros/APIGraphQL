const mongoose = require('mongoose');
const schema = mongoose.Schema

const ProductModel = mongoose.model('product', new schema({
    name: String,
    value: Number,
  }));
  
  module.exports = ProductModel