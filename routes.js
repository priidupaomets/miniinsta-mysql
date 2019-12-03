exports.index = function(req, res) {
	res.send('<h1>Hello</h1>');
};

exports.users = function(req, res) {
    res.send('<h1>Users</h1>');
};

exports.default = function(req, res) {
	res.send('Invalid route');
};
