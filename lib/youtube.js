var request = require('request');
var queryString = require('querystring');

var YouTube = function() {

	var self = this;

	/**
	 * API v3 Url
	 * @type {string}
	 */
	self.url = 'https://www.googleapis.com/youtube/v3/';

	/**
	 * params
	 * https://developers.google.com/youtube/v3/docs/search/list
	 * @type {Object}
	 */
	self.params = {};

	self.parts = [];

	self.data = [];

	self.key = '';

	/**
	 * Set private key to class
	 * @param {string} key
	 */
	self.setKey = function(key) {
		self.key = key;
	};

	/**
	 *
	 * @param {string} name
	 */
	self.addPart = function(name) {
		self.parts.push(name);
	};

	/**
	 *
	 * Optional parameters
	 * https://developers.google.com/youtube/v3/docs/search/list
	 *
	 * @param {string} key
	 * @param {string} value
	 */
	self.addParam = function(key, value) {
		self.params[key] = value;
	};

	/**
	 *
	 * @param {string} path
	 * @returns {string}
	 */
	self.getUrl = function(path) {
		return self.url + path + '?' + queryString.stringify(self.params);
	};

	/**
	 *
	 * @returns {string}
	 */
	self.getParts = function() {
		return self.parts.join(',');
	};

	/**
	 * Simple http request
	 * @param {string} url
	 * @param {string} callback
	 */
	self.request = function(url, callback) {
		request(url, function(error, response, body) {
			if (error) {
				callback(error);
			} else {
				var data = JSON.parse(body);
				if (response.statusCode == 200) {
					callback(null, data);
				} else {
					callback(data.error);
				}
			}
		});
	};

	/**
	 * Return error object
	 * @param {string} message
	 */
	self.newError = function(message) {
		return {
			error: {
				message: message
			}
		};
	};

	/**
	 * Validate params
	 */
	self.validate = function() {
		if (!self.key) {
			return self.newError('Please set a key using setKey method. Get an key in https://console.developers.google.com');
		} else {
			return null;
		}
	};

	/**
	 * Initialize parts
	 */
	self.clearParamsAndParts = function() {
		self.parts = [];
		self.params = {};
		self.addParam('key', self.key);
	};

	/**
	 * Initialize data
	 */
	self.clearData = function() {
		self.data = [];
	};

	/**
	 * Video data from ID
	 * @param {string} id
	 * @param {function} callback
	 */
	self.getVideoById = function(id, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {

			self.clearParamsAndParts();

			self.addPart('snippet');
			self.addPart('statistics');

			self.addParam('part', self.getParts());
			self.addParam('id', id);

			self.request(self.getUrl('videos'), callback);
		}
	};




	/**
	 * Get info about channel assosiated with username
	 * @param {string} username
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/channels/list
	 */

	self.getChannelByUsername = function(username, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParamsAndParts();


			self.addPart('contentDetails');

			self.addParam('part', self.getParts());
			self.addParam('forUsername', username);

			self.request(self.getUrl('channels'), callback);
		}
	}

	/**
	 * Get channel info by username, contains channelID, playlist of uploads and likes
	 * @param {string} username
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/channels/list
	 */

	self.getChannelById = function(id, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParamsAndParts();


			self.addPart('snippet');
			self.addPart('contentDetails');
			self.addPart('statistics');


			self.addParam('part', self.getParts());
			self.addParam('id', id);

			self.request(self.getUrl('channels'), callback);
		}
	}



	/**
	 * Comment Thread from Video Id
	 * @param {string} id
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/commentThreads/list
	 */

	self.getCommentThreadsByVideoId = function(videoId, callback, pageToken) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			if (pageToken) {
				self.addParam('pageToken', pageToken);
			} else {
				self.clearData();
			}

			self.clearParamsAndParts();

			self.addPart('snippet');

			self.addParam('part', self.getParts());
			self.addParam('videoId', videoId);
			self.addParam('maxResults', 100);

			self.request(self.getUrl('commentThreads'), callback);

		// if (self.data.length < maxResults) {
		// 	self.request(self.getUrl('commentThreads'), function(err, result) {
		// 		if (err) return callback(err);
		//
		// 		// push all items from result set to data array, stop if number of maxResults reached
		// 		for (var i = 0; i < result.items.length; i++) {
		// 			if (self.data.length < maxResults) {
		// 				self.data.push(result.items[i]);
		// 			}
		// 		}
		//
		// 		if (result.nextPageToken && self.data.length < maxResults) {
		// 			// recursive function call with nextPageToken to get the next reult set from api
		// 			self.getCommentThreadsByVideoId(videoId, maxResults, callback, result.nextPageToken);
		// 		} else {
		// 			// if there is no next page to result set, stop
		// 			console.log('Got ' + self.data.length + ' commentThreads for video ' + videoId + 'from API');
		// 			callback(null, self.data);
		// 		}
		// 	});
		//
		// } else {
		// 	console.log('Got ' + self.data.length + ' commentThreads for video ' + videoId + ' from API');
		// 	callback(null, self.data);
		// }

	}
}

/**
 * Single comment from Video Id
 * @param {string} id
 * @param {function} callback
 * https://developers.google.com/youtube/v3/docs/comments/list
 */

self.getCommentById = function(id, callback) {
	var validate = self.validate();

	if (validate !== null) {
		callback(validate);
	} else {
		self.clearParamsAndParts();


		self.addPart('snippet');

		self.addParam('part', self.getParts());
		self.addParam('id', id);

		self.request(self.getUrl('comments'), callback);
	}
}


/**
 * Playlists data from Playlist Id
 * @param {string} id
 * @param {function} callback
 * https://developers.google.com/youtube/v3/docs/playlists/list
 */
self.getPlayListsById = function(id, callback) {
	var validate = self.validate();

	if (validate !== null) {
		callback(validate);
	} else {
		self.clearParamsAndParts();


		self.addPart('snippet');
		self.addPart('contentDetails');
		self.addPart('status');
		self.addPart('player');

		self.addParam('part', self.getParts());
		self.addParam('id', id);

		self.request(self.getUrl('playlists'), callback);
	}
};

/**
 * Playlists data from Playlist Id
 * @param {string} playlistId
 * @param {function} callback
 * https://developers.google.com/youtube/v3/docs/playlistItems/list
 */
self.getPlayListItemsById = function(playlistId, callback, pageToken) {
	var validate = self.validate();

	if (validate !== null) {
		callback(validate);
	} else {
		self.clearParamsAndParts();

		if (pageToken) {
			self.addParam('pageToken', pageToken);
		} else {
			self.clearData();
		}

		self.addPart('snippet');

		self.addParam('part', self.getParts());
		self.addParam('playlistId', playlistId);
		self.addParam('maxResults', 50);

		self.request(self.getUrl('playlistItems'), callback);


		// if (self.data.length < maxResults) {
		// 	self.request(self.getUrl('playlistItems'), function(err, result) {
		// 		if (err) return callback(err);
		//
		// 		// push all items from result set to data array, stop if number of maxResults reached
		// 		for (var i = 0; i < result.items.length; i++) {
		// 			if (self.data.length < maxResults) {
		// 				// excluded private or delted videos
		// 				self.data.push(result.items[i]);
		//
		// 			}
		// 		}
		//
		// 		if (result.nextPageToken && self.data.length < maxResults) {
		// 			// recursive function call with nextPageToken to get the next reult set from api
		// 			self.getPlayListItemsById(playlistId, maxResults, callback, result.nextPageToken);
		// 		} else {
		// 			console.log('Got ' + self.data.length + ' playlistItems for playlist ' + playlistId + 'from API');
		// 			// if there is no next page to result set, stop
		// 			callback(null, self.data);
		// 		}
		// 	});
		//
		// } else {
		// 	console.log('Got ' + self.data.length + ' playlistItems for playlist ' + playlistId + 'from API');
		// 	callback(null, self.data);
		// }



	}
};


/**
 * Videos data from query
 * @param {string} query
 * @param {int} maxResults
 * @param {function} callback
 */
self.search = function(query, maxResults, callback) {
	var validate = self.validate();

	if (validate !== null) {
		callback(validate);
	} else {
		self.clearParamsAndParts();


		self.addPart('snippet');

		self.addParam('part', self.getParts());
		self.addParam('q', query);
		self.addParam('maxResults', maxResults);

		self.request(self.getUrl('search'), callback);
	}
};


/**
 * Videos data from query
 * @param {string} id
 * @param {int} maxResults
 * @param {function} callback
 * Source: https://github.com/paulomcnally/youtube-node/pull/3/files
 */
self.related = function(id, maxResults, callback) {
	var validate = self.validate();

	if (validate !== null) {
		callback(validate);
	} else {
		self.clearParamsAndParts();


		self.addPart('snippet');

		self.addParam('part', self.getParts());
		self.addParam('relatedToVideoId', id);
		self.addParam('maxResults', maxResults);
		self.addParam('type', 'video');
		self.addParam('order', 'relevance');

		self.request(self.getUrl('search'), callback);
	}
};
};

module.exports = YouTube;
