var ObjectID = require('mongodb').ObjectID;

CollectionDriver = function(db) {
	this.db = db;
};

//find a collection by name
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else {
			callback(null, the_collection);
		}
	});
};

//return all entities in a collection
CollectionDriver.prototype.findAll = function(collectionName, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else {
			the_collection.find().toArray(function(error, results) {
				if (error) {
					callback(error);
				} else {
					callback(null, results);
				}
			});
		}
	});
}

//return a specific entity by _id in a collection
CollectionDriver.prototype.get = function(collectionName, id, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else {
			var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
			if (!checkForHexRegExp.test(id)) {
				callback({error: "invalid id"});
			} else {
				the_collection.findOne({'_id': ObjectID(id)}, function(error, doc) {
					if (error) {
						callback(error);
					} else {
						callback(null, doc);
					}
				});
			}
		}
	});
}

//save a new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else {
			obj.created_at = new Date();
			the_collection.insert(obj, function() {
				callback(null, obj);
			});
		}
	});
};

//update an existing object
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else{
			obj._id = ObjectID(entityId);
			obj.updated_at = new Date();
			the_collection.save(obj, function(error,doc) {
				if (error) {
					callback(error);
				} else {
					callback(null, obj);
				}
			});
		}
	});
};

//delete a specific object
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) {
			callback(error);
		} else {
			the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) {
				if (error) {
					callback(error);
				} else {
					callback(null, doc);
				}
			});
		}
	});
}

exports.CollectionDriver = CollectionDriver;