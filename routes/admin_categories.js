const express = require('express');

const router = express.Router();

// Get Category model
var Category = require('../models/category');

/*
* GET category index
*/
router.get('/', (req, res) => {
  Category.find((err, categories) => {
    if (err) return console.log(err);
    res.render('admin/categories', {
      categories: categories
    });
  });
});

/*
* GET add category
*/
router.get('/add-category', (req, res) => {
  var title = "";

  res.render('admin/add_category', {
    title: title
  });
});

/*
* POST add category
*/
router.post('/add-category', (req, res) => {
  req.checkBody('title', 'title must have a value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/add_category', {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({ slug: slug }, (err, category) => {
      if (category) {
        // req.flash('danger', 'Category slug exists, choose another');
        res.render('admin/add_category', {
          title: title
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });
        category.save((err) => {
          if (err) return console.log(err);
          // req.flash('Success', 'Category added!');
          res.redirect('/admin/categories');
        });
      }
    });
  }
});

/*
* GET edit category
*/
router.get('/edit-category/:id', (req, res) => {
  Category.findById(req.params.id).then((category) => {
    if (!category) { //if category not exist in db
      return res.status(404).send('Category not found');
    }
    res.render('admin/edit_category', { //category  exist
      title: category.title,
      id: category._id
    });
  }).catch((e) => {//bad request 
    res.status(400).send(e);
  });
});

/*
* POST edit category
*/
router.post('/edit-category/:id', (req, res) => {
  req.checkBody('title', 'title must have a value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    // console.log('errors');
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Category.findOne({ slug: slug, _id: { '$ne': id } }, (err, category) => {
      if (category) {
        // req.flash('danger', 'Category title exists, choose another');
        res.render('admin/edit_category', {
          title: title,
          id: id
        });
      } else {
        Category.findById(id, (err, category) => {
          if (err) return console.log(err);
          category.title = title;
          category.slug = slug;
          category.save((err) => {
            if (err) return console.log(err);
            // req.flash('success', 'Category added!');
            res.redirect('/admin/categories/edit-category/' + id);
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