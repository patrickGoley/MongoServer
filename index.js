var http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser');
	path = require('path'),
	mongo = require('mongodb');
	CollectionDriver = require('./collectionDriver').CollectionDriver;




var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//parse incoming request bodies into JSON
app.use(bodyParser());

//serve static files under the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//set up the mongodb collection driver
var collectionDriver;
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

console.log("connecting to mongo db at " + mongoUri);

mongo.Db.connect(mongoUri, function(err, db) {
	if (err) {
		console.error("error connecting to mongodb " + err);
		process.exit(1);
	}
	collectionDriver = new CollectionDriver(db);
});

//return all entities for the given collection
app.get('/:collection', function(req, res) {
	var params = req.params;
	collectionDriver.findAll(req.params.collection, function(error, objs) {
		if (error) {
			res.send(400, error);
		} else {
			if (req.accepts('html')) {
				res.render('data', {objects: objs, collection: req.params.collection});
			} else {
				res.set('Content-Type', 'application/json');
				res.sent(200, objs);
			}
		}
	});
});

//post a new object to a collection
app.post('/:collection', function(req, res) {
	var object = req.body;
	var collection = req.params.collection;
	collectionDriver.save(collection, object, function(err, docs) {
		if (err) {
			res.send(400, err);
		} else {
			res.send(201, docs);
		}
	});
});

//post a Share object
app.post('/shares/:type', function(req, res) {
	var object = req.body;
	var collection = req.params.type;
	collectionDriver.save(collection, object, function(err, docs) {
		if (err) {
			res.send(400, err);
		} else {
			res.send(201, docs);
		}
	});
});

//report all shares of a particular type
app.get('/shares/:type', function(req, res) {
	var object = req.body;
	var collection = req.params.type;
	collectionDriver.findAll(collection, function(error, objs) {
		if (error) {
			res.send(400, error);
		} else {
			if (req.accepts('html')) {
				res.render('data', {objects: objs, collection: collection});
			} else {
				res.set('Content-Type', 'application/json');
				res.sent(200, objs);
			}
		}
	});
});

//get the items shared with a userId
app.get('/shares/:type/:userId', function(req, res) {
	var collection = req.params.type;
	var userId = req.params.userId;
	collectionDriver.findSharedWithMe(collection, userId, function(error, objs) {
		if (error) {
			res.send(400, error);
		} else {
			if (req.accepts('html')) {
				res.render('data', {objects: objs, collection: collection});
			} else {
				res.set('Content-Type', 'application/json');
				res.send(200, objs);
			}
		}
	});
});

app.post('shares/:type/', function(req, res) {
	var object = req.body;
	var collection = req.params.type;
	var userId = req.params.userId;
	collectionDriver.save(collection, object, function(error, docs) {
		if (error) {
			res.send(400, err);
		} else {
			res.send(201, docs);
		}
	})
})

//update an existing object
app.put('/:collection/:entity', function(req, res) {
	var params = req.params;
	var entity = params.entity;
	var collection = params.collection;
	if (entity) {
		collectionDriver.update(collection, req.body, entity, function(error, objs) {
			if (error) {
				res.send(400, error);
			} else {
				res.send(200, objs);
			}
		});
	} else {
		var error = { "message": "Cannot PUT a whole collection" };
		res.send(400, error);
	}
});

//delete a specific object
app.delete("/:collection/:entity", function(req, res) {
	var params = req.params;
	var entity = params.entity;
	var collection = params.collection;
	if (entity) {
		collectionDriver.delete(collection, entity, function(error, objs) {
			if (error) {
				res.send(400, error);
			} else {
				res.send(200, objs);
			}
		});
	}
});

//return a 404 page for unhandled requests
app.use(function (req,res) {
    res.render('404', {url:req.url}); 
});

//start the http server
http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

