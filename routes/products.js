const express = require('express');

const router = express.Router();

// Get Product Model
var Product = require('../models/product');

// Get Category Model
var Category = require('../models/category');

/*
 *  GET All Products
 */
router.get('/', (req, res) => {
  Product.find((err, products) => {
    if (err) console.log(err);
    res.render('all_products', {
      title: 'All products',
      products: products
    });
  });
});

/*
 *  GET Products By Category
 */
router.get('/:category', (req, res) => {
  var categorySlug = req.params.category;

  Category.findOne({ slug: categorySlug }, (err, c) => {
    Product.find({ category: categorySlug }, (err, products) => {
      if (err) console.log(err);
      console.log(c);
      res.render('cat_products', {
        title: 'Category Products',
        products: products   
      });
    });
  });
});

module.exports = router;