var express = require('express');

var router = express.Router();
var {propertyModel} = require('../schema/propertySchema')

router.get('/properties', async(req, res) => {
    try {
        const properties = await propertyModel.find({});
        res.send({statusCode:200, properties, message:"All Properties Fetched"})
    } catch (error) {
        res.send({statusCode:500, error, message:"Something went wrong"})
    }
})

router.get('/searchedproperties', async (req, res) => {
    try {
      const { location, priceMin, priceMax, propertyType } = req.query;
      let filters = {};
  
      if (location) filters.location = new RegExp(location, 'i');
      if (priceMin && priceMax) filters.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
      if (propertyType) filters.propertytype = propertyType;
  
      const properties = await propertyModel.find(filters);
      res.send({ statusCode: 200, properties, message: "Filtered Properties Fetched" });
    } catch (error) {
      res.send({ statusCode: 500, error, message: "Something went wrong" });
    }
  });
  

router.post('/add-property', async(req, res) => {
    try {
        const {Name, imgurl,Description,location,price,propertytype} = req.body;

        const newProperty = new propertyModel({
            Name,
            imgurl,
            Description,
            location,
            price,
            propertytype
        })
        const savedProperty = await newProperty.save();
        res.send({statusCode:200, savedProperty, message:"Property Added Successfully"})
    } catch (error) {
        res.send({statusCode:500, error, message:"Something went wrong! Property not added"})
    }
})

module.exports = router;