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
* POST reorder pages
*/
router.post('/reorder-pages', (req, res) => {
  var ids = req.body['id[]'];

  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;


    ((count) => {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save((err) => {
          if (err) return console.log(err);
        });
      });
    })(count);
  }
});

/*
* GET edit page
*/
router.get('/edit-page/:slug', (req, res) => {
  Page.findOne({ slug: req.params.slug }).then((page) => {
    if (!page) { //if page not exist in db
      return res.status(404).send('Page not found');
    }
    res.render('admin/edit_page', { //page  exist
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  }).catch((e) => {//bad request 
    res.status(400).send(e);
  });
});

/*
* POST edit page
*/
router.post('/edit-page/:slug', (req, res) => {
  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.body.id;

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
            res.redirect('/admin/pages/edit-page/' + page.slug);
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