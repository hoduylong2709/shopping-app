const express = require('express');

const router = express.Router();

// Get Product Model
var Product = require('../models/product');

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
 *  GET a page
 */
router.get('/:slug', (req, res) => {
  var slug = req.params.slug;

  Page.findOne({ slug: slug }, (err, page) => {
    if (err) console.log(err);
    if (!page) {
      res.redirect('/');
    } else {
      res.render('index', {
        title: page.title,
        content: page.content
      });
    }
  });
});

module.exports = router;