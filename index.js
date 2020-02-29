// Module requires
var express = require('express');
var path = require('path');
var logger = require('morgan');
var apicache = require('apicache');
var redis = require('redis');
var routes = require('./routes');

// Instatiate application instance
var app = express();

// instantiate default API cache
let cache = apicache.middleware;
// if redisClient option is defined, apicache will use redis client instead of built-in memory store
// let cache = apicache.options({ redisClient: redis.createClient(6379, '127.0.0.1', { no_ready_check: true }) }).middleware;

// Configure logger middleware
app.use(logger('dev'));

// Let's add a View Engine - Handlebars
app.set('view engine', 'hbs');

// Initialize public folder as a location for static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle URL root 
app.get('/', routes.index);

// UI for the API
app.get('/api', routes.apiIndex);

// Application-specific routes
// app.get('/api/users/:id([0-9]{1,9})?', routes.usersByID);
// app.get('/api/users/:username?', routes.usersByUsername);
app.get('/api/users/:id?', cache('10 seconds'), routes.users);
app.get('/api/users_insecure/:id?', routes.usersInsecure);

app.get('/api/frontpage', cache('10 seconds'), routes.frontpage);
app.get('/api/profile/:id', cache('10 seconds'), routes.profilePage);
app.get('/api/posts/:id', cache('10 seconds'), routes.postDetails);
app.get('/api/stats', cache('10 seconds'), routes.statistics);
app.get('/api/stats/top10/postingusers', cache('10 seconds'), routes.top10PostingUsers);
app.get('/api/stats/registrations', cache('10 seconds'), routes.userRegistrations);
app.get('/api/stats/genderdivision', cache('10 seconds'), routes.genderDivision);

// Default response when no matching routes were found
app.get('*', routes.default);

// Initialize the server
var server = app.listen(3000, function() {
    console.log('Listening on port 3000');
});
