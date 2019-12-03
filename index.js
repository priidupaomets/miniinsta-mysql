// Module requires
var express = require('express');

// Instatiate application instance
var app = express();

// Initialize the server
var server = app.listen(3000, function() {
    console.log('Listening on port 3000');
});
