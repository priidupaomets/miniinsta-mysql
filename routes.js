var sql = require('./sql');

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.index = function(req, res) {
	res.send('<h1>Hello</h1>');
};

exports.apiIndex = function(req, res) {
    var vm = {                          // vm = View Model
        title: 'API Functions',
        api: [
            { name: 'Users', url: '/api/users?pagesize=20&page=2' },         
            { name: 'User by ID', url: '/api/users/25' },         
            { name: 'User by Username', url: '/api/users/cligerw' },         
            { name: 'User by Username (Insecure)', url: '/api/users_insecure/cbaccup3b' },         
            { name: 'Front Page', url: '/api/frontpage' },
            { name: 'Profile Page', url: '/api/profile/cbaccup3b' },
            { name: 'Post', url: '/api/posts/19' },
            { name: 'General Statistics', url: '/api/stats' },
            { name: 'TOP 10 Posting Users', url: '/api/stats/top10/postingusers' },
            { name: 'Registrations', url: '/api/stats/registrations' },
            { name: 'Gender Division', url: '/api/stats/genderdivision' }
	    ],
        injections: [
            { name: 'Basic test (Insecure)', url: '/api/users_insecure/blaah\'%20or%201=1%20--%20'},
            { name: 'Basic test (Secure)', url: '/api/users/blaah\'%20or%201=1%20--%20'},
            { name: 'Alternate Query (Insecure)', url: '/api/users_insecure/blaah\'%20or%201=0;%20select%20*%20from%20MediaType%20--%20'},
            { name: 'Alternate Query (Secure)', url: '/api/users/blaah\'%20or%201=0;%20select%20*%20from%20MediaType%20--%20'},
        ]
    };
    
    res.render('api-index', vm);
};

exports.usersInsecure = function(req, res) {
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

exports.users = function(req, res) {
	// Define SQL query
    var query = 'select * from User';
	
    // If there's an ID passed along
    if (typeof(req.params.id) !== 'undefined') {
        if (isNumber(req.params.id)) {
            query = query.concat(' where id=?');
        } else {
            query = query.concat(' where Username=?');            
        }
    }

	// Invoke the query
    sql.querySqlWithParams(query, [req.params.id], function(data) {
        if (data !== undefined) {
            // console.log('DATA rows affected: ' + data.length);

            // If parameter was defined, return only single item, otherwise return an entire array
            if (typeof(req.params.id) !== 'undefined') {
                res.send(data[0]);
            } else {
                res.send(data);
            }
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});
};

exports.frontpage = function(req, res) {
    //res.send('<h1>Front Page</h1>');

    let userId = 19;

	// Define SQL query
//     var query = 'SELECT DerivedTbl.PostID, Username, CreationTime,  ' +
// '     PostMedia.MediaTypeID, PostMedia.MediaFileUrl, ' +
// '     NumberOfLikes, ' +
// '     (SELECT COUNT(ID) FROM PostMedia AS Media WHERE DerivedTbl.PostID = Media.PostID) AS NumberOfMediaFiles ' +
// ' FROM ( ' +
// '  SELECT Post.ID AS PostID, User.Username, Post.LocationName, Post.Location, ' +
// '         Post.CreationTime, Min(PostMedia.ID) AS PostMediaID, ' +
// '         (SELECT Count(PostID) FROM Liking WHERE PostID = Post.ID) AS NumberOfLikes ' +
// '    FROM Post INNER JOIN ' +
// '         User ON Post.UserID = User.ID INNER JOIN ' +
// '         PostMedia ON Post.ID = PostMedia.PostID INNER JOIN ' +
// '         Following ON User.ID = Following.FolloweeUserID ' +
// '   WHERE Following.FollowerUserID =  ' + userId +
// '   GROUP BY Post.ID, User.Username, Post.CreationTime ' +
// ' ) DerivedTbl INNER JOIN ' +
// '   PostMedia ON DerivedTbl.PostMediaID = PostMedia.ID ' +
// ' ORDER BY CreationTime DESC, DerivedTbl.PostID';
    
    let query = "CALL GetFrontPageData (?)";

	// Invoke the query
    sql.querySqlWithParams(query, [userId], function(data) {
        if (data !== undefined) {
            res.send(data); // In case of stored procedure, the returned data has different structure
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});    
};

exports.profilePage = function(req, res) {
    //res.send('<h1>Profile</h1>');

    let condition = '';

    // If there's an ID passed along
    if (isNumber(req.params.id)) {
        condition = 'User.id=' + req.params.id;
    } else {
        condition = 'User.Username=\'' + req.params.id + '\'';            
    }

	// Define SQL query
    var query = 'SELECT ID, Username, Website, Bio, ProfileImageUrl, ' +
'     (SELECT Count(ID) FROM Post WHERE UserID = User.ID) AS NumberOfPosts, ' +
'     (SELECT Count(*) FROM Following WHERE FolloweeUserID = User.ID) AS NumberOfFollowers, ' +
'     (SELECT Count(*) FROM Following WHERE FollowerUserID = User.ID) AS NumberOfFollowings ' +
' FROM User ' +
' WHERE ' + condition + '; ' +

' SELECT DerivedTbl.PostID, LocationName, Location, CreationTime, ' +
'        PostMedia.MediaTypeID, PostMedia.MediaFileUrl, ' +
'        (SELECT COUNT(ID) FROM PostMedia AS Media WHERE DerivedTbl.PostID = Media.PostID) AS NumberOfMediaFiles ' +
'   FROM ( ' +
' 	SELECT Post.ID AS PostID, Post.LocationName, Post.Location, ' +
' 		   Post.CreationTime, Min(PostMedia.ID) AS PostMediaID ' +
' 	  FROM Post INNER JOIN ' +
' 		   User ON Post.UserID = User.ID LEFT OUTER JOIN ' +
' 		   PostMedia ON Post.ID = PostMedia.PostID ' +
'    WHERE ' + condition + 
' 	 GROUP BY Post.ID, Post.LocationName, Post.Location, Post.CreationTime ' +
'    ) DerivedTbl LEFT OUTER JOIN ' +
'      PostMedia ON DerivedTbl.PostMediaID = PostMedia.ID ' +
'  ORDER BY CreationTime DESC, DerivedTbl.PostID desc;';

	// Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
            // Retrieve first element of the first array, containing person profile
            var profile = data[0][0];

            if (data.length > 1)
            {
                posts = data[1];

                // Attach the 2nd MARS dataset to the profile as an array of Posts
                if (posts !== undefined)
                    profile.Posts = posts;
                else
                    profile.Posts = [];
            }

            res.send(profile);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});    
};

exports.postDetails = function(req, res) {
    //res.send('<h1>Post</h1>');
    
	// Define SQL query
    var query = 'SELECT Post.ID, Username, User.ProfileImageUrl, LocationName, Location, ' +
'     IfNull((SELECT Count(PostID) ' +
'               FROM Liking ' +
'              WHERE PostID = Post.ID), 0) AS Likes ' +
' FROM Post INNER JOIN ' +
'     User ON Post.UserID = User.ID ' +
' WHERE Post.ID = ' + req.params.id +
' ORDER BY Post.CreationTime DESC; ' +

' SELECT PostMedia.ID, PostMedia.MediaTypeID, PostMedia.MediaFileUrl ' +
' FROM Post INNER JOIN ' +
'     PostMedia ON Post.ID = PostMedia.PostID  ' +
' WHERE Post.ID = ' + req.params.id +
' ORDER BY Post.CreationTime DESC; ' +

' SELECT ID AS CommentID, Comment, CreationTime ' +
' FROM Comment ' +
' WHERE PostID = ' + req.params.id +
' ORDER BY CreationTime; ';
	
	// Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
            // Get the post header
            let post = data[0][0];

            // If present, take post media
            if (data.length > 1) {
                let postMedia = data[1];

                post.Media = postMedia;
            }

            // When comments are also available, add those as well
            if (data.length > 2) {
                let comments = data[2];

                post.Comments = comments;
            }

            res.send(post);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});    
};

exports.statistics = function(req, res) {
    //res.send('<h1>Statistics - General</h1>');
    
 	// Define SQL query
     var query = 'SELECT ' +
' (SELECT Count(ID) FROM User) AS UserCount, ' +
' (SELECT Count(ID) FROM Post) AS PostCount, ' +
' (SELECT Avg(PostCount) ' +
'  FROM (SELECT UserID, Count(ID) AS PostCount FROM Post GROUP BY UserID) PostsPerUser) AS AvgPostsPerUser, ' +
' (SELECT Max(PostCount) ' +
'  FROM (SELECT UserID, Count(ID) AS PostCount FROM Post GROUP BY UserID) PostsPerUser) AS MaxPostsPerUser, ' +
' (SELECT Avg(CommentCount) ' +
'  FROM (SELECT PostID, Count(ID) AS CommentCount FROM Comment GROUP BY PostID) CommentsPerPost) AS AvgCommentsPerPost, ' +
' (SELECT Max(CommentCount) ' +
'  FROM (SELECT PostID, Count(ID) AS CommentCount FROM Comment GROUP BY PostID) CommentsPerPost) AS MaxCommentsPerPost, ' +
' (SELECT Avg(LikeCount) ' +
'  FROM (SELECT PostID, Count(PostID) AS LikeCount FROM Liking GROUP BY PostID) LikesPerPost) AS AvgLikesPerPost, ' +
' (SELECT Max(LikeCount) ' +
'  FROM (SELECT PostID, Count(PostID) AS LikeCount FROM Liking GROUP BY PostID) LikesPerPost) AS MaxLIkesPerPost;';
	
     // Invoke the query
     sql.querySql(query, function(data) {
         if (data !== undefined) {
             res.send(data[0]); // Return only the first row
         }
     }, function(err) {
         console.log('ERROR: ' + err);
         res.status(500).send('ERROR: ' + err);
     });   
};

exports.top10PostingUsers = function(req, res) {
    //res.send('<h1>Statistics - TOP 10 Posting users</h1>');

	// Define SQL query
    var query = 'SELECT User.ID, User.Username, Count(Post.ID) AS Posts ' +
'  FROM Comment INNER JOIN ' +
'       Post ON Comment.PostID = Post.ID INNER JOIN ' +
'       User ON Post.UserID = User.ID ' +
' GROUP BY User.ID, User.Username ' +
' ORDER BY Posts desc  ' +
' LIMIT 10;';
	
	// Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
            res.send(data);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
	});    
};

exports.userRegistrations = function(req, res) {
    //res.send('<h1>Statistics - User registrations by dates</h1>');

    // Define SQL query
    var query = 'SELECT CAST(CreationTime AS Date) AS Date, Count(ID) AS Count ' +
'  FROM User ' +
' GROUP BY CAST(CreationTime AS Date) ' +
' ORDER BY Date;';

    // Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
            res.send(data);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
};

exports.genderDivision = function(req, res) {
    //res.send('<h1>Statistics - Gender Division</h1>');
    
	// Define SQL query
    var query = 'SELECT Gender.Name AS Gender, Count(User.ID) AS Users ' +
'  FROM User INNER JOIN ' +
'       Gender ON User.GenderID = Gender.ID ' +
' GROUP BY Gender.Name;';
	
	// Invoke the query
    sql.querySql(query, function(data) {
        if (data !== undefined) {
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
