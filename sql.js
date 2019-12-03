var mysql = require('mysql');
// Full details on MySQL module: https://github.com/mysqljs/mysql or https://www.npmjs.com/package/mysql

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',  // anysql.itcollege.ee
    user            : 'testapp',
    password        : 'testApp123',
    database        : 'miniinsta',
    multipleStatements: true  // for being able to issue MARS commands (multiple queries)
  });

exports.querySql = function(query, onData, onError) {
    try {
        pool
            .query(query, function (error, results, fields) {
                if (error) 
                    onError(error);

                onData(results);
              });
    } catch (err) {
        // Log errors
        if (onError !== undefined)
            onError(err);
    }
};

// pool.on('error', err => {
//     console.log('Error with MSSQL: ' + err);
// });
