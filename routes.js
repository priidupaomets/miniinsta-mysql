var sql = require('./sql');

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.index = function(req, res) {
	res.send('<h1>Hello</h1>');
};

exports.users = function(req, res) {
	// Define SQL query
    var query = 'select * from User';
	
    // If there's an ID passed along
    if (typeof(req.params.id) !== 'undefined') {
        if (isNumber(req.params.id)) {
            query = query.concat(' where id=' + req.params.id);
        } else {
            query = query.concat(' where Username=\'' + req.params.id + '\'');            
        }
    }

	// Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
            // console.log('DATA rows affected: ' + data.length);
            res.send(data);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});
};

exports.frontpage = function(req, res) {
	res.send('<h1>Front Page</h1>');
};

exports.profilePage = function(req, res) {
	res.send('<h1>Profile</h1>');
};

exports.postDetails = function(req, res) {
	res.send('<h1>Post</h1>');
};

exports.statistics = function(req, res) {
	res.send('<h1>Statistics - General</h1>');
};

exports.top10PostingUsers = function(req, res) {
	res.send('<h1>Statistics - TOP 10 Posting users</h1>');
};

exports.userRegistrations = function(req, res) {
	res.send('<h1>Statistics - User registrations by dates</h1>');
};

exports.genderDivision = function(req, res) {
	res.send('<h1>Statistics - Gender Division</h1>');
};

exports.default = function(req, res) {
	res.send('Invalid route');
};
