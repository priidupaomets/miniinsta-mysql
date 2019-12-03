var sql = require('./sql');

exports.index = function(req, res) {
	res.send('<h1>Hello</h1>');
};

exports.users = function(req, res) {
	// Define SQL query
    var query = 'select * from User';
	
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

exports.default = function(req, res) {
	res.send('Invalid route');
};
