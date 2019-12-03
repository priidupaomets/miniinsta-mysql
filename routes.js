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

exports.default = function(req, res) {
	res.send('Invalid route');
};
