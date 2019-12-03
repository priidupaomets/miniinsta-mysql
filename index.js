// Module requires
var express = require('express');
var routes = require('./routes');

// Instatiate application instance
var app = express();

// Handle URL root 
app.get('/', routes.index);

// Application-specific routes
app.get('/api/users/:id?', routes.users);

// Default response when no matching routes were found
app.get('*', routes.default);

// Initialize the server
var server = app.listen(3000, function() {
    console.log('Listening on port 3000');
});
