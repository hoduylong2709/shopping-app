const express = require('express');

const router = express.Router();

/*
* GET pages index
*/
router.get('/', (req, res) => {
  res.send('Admin area');
});

/*
* GET add page
*/
router.get('/add-page', (req, res) => {
  var title = "";
  var slug = "";
  var content = "";

  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });
});

module.exports = router;