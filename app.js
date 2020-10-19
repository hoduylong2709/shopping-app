const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');

// Connect to db
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB')
});

// Init app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set routes
app.use('/admin/pages', adminPages);
app.use('/', pages);

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log('Server started on port ' + port);
});