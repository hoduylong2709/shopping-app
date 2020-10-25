const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const router = express.Router();

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
* GET products index
*/
router.get('/', (req, res) => {
  var count;
  Product.count((err, c) => {
    count = c;
  });
  Product.find((err, products) => {
    res.render('admin/products', {
      products: products,
      count: count
    });
  });
});

/*
* GET add product
*/
router.get('/add-product', (req, res) => {
  var title = "";
  var desc = "";
  var price = "";

  Category.find((err, categories) => {
    res.render('admin/add_product', {
      title: title,
      desc: desc,
      categories: categories,
      price: price
    });
  });
});

/*
* POST add product
*/
router.post('/add-product', (req, res) => {
  if (!req.files) { imageFile = ""; }
  if (req.files) {
    var imageFile = typeof (req.files.image) !== "undefined" ? req.files.image.name : "";
  }

  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('desc', 'Description must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    Category.find((err, categories) => {
      res.render('admin/add_product', {
        errors: errors,
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    });
  } else {
    Product.findOne({ slug: slug }, (err, product) => {
      if (product) {
        // req.flash('danger', 'Product title exists, choose another');
        Category.find((err, categories) => {
          res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          });
        });
      } else {
        var price2 = parseFloat(price).toFixed(2);
        var product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile
        });
        product.save((err) => {
          if (err) return console.log(err);
          fs.mkdir('public/product_images/' + product._id, function (err) {
            if (err) { return console.log(err); }
          });

          fs.mkdir('public/product_images/' + product._id + '/gallery', function (err) {
            if (err) { return console.log(err); }
          });

          fs.mkdir('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
            if (err) { return console.log(err); }
          });
          if (imageFile != "") {
            var productImage = req.files.image;
            var path = 'public/product_images/' + product._id + '/' + imageFile;

            productImage.mv(path, (err) => {
              return console.log(err);
            });
          }
          // req.flash('Success', 'Product added!');
          res.redirect('/admin/products');
        });
      }
    });
  }
});

/*
* GET edit product
*/
router.get('/edit-product/:id', (req, res) => {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find((err, categories) => {
    Product.findById(req.params.id, (err, p) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        var galleryDir = 'public/product_images/' + p._id + '/gallery';
        var galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render('admin/edit_product', {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, '-').toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id
            });
          }
        });
      }
    });
  });
});

/*
* POST edit page
*/
router.post('/edit-page/:id', (req, res) => {
  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    // console.log('errors');
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
      if (page) {
        // req.flash('danger', 'Page slug exists, choose another');
        res.render('admin/edit_page', {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, (err, page) => {
          if (err) return console.log(err);
          page.title = title;
          page.slug = slug;
          page.content = content;
          page.save((err) => {
            if (err) return console.log(err);
            // req.flash('success', 'Page added!');
            res.redirect('/admin/pages/edit-page/' + id);
          });
        });
      }
    });
  }
});

/*
* GET delete page
*/
router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err) return console.log(err);
    // req.flash('success', 'Page deleted!');
    res.redirect('/admin/pages/');
  });
});

module.exports = router;