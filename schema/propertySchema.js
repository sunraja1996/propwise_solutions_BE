const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    Name: String,
    imgurl: String,
    Description: String,
    location: String,
    price: String,
    propertytype:[String],
  });

const propertyModel = mongoose.model('properties', propertySchema)

module.exports= {propertyModel}