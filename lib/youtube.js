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

	self.comments = [];

	/**
	 * Set private key to class
	 * @param {string} key
	 */
	self.setKey = function(key) {
		self.addParam('key', key);
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
		if (!self.params.key) {
			return self.newError('Please set a key using setKey method. Get an key in https://console.developers.google.com');
		} else {
			return null;
		}
	};

	/**
	 * Initialize parts
	 */
	self.clearParts = function() {
		self.parts = [];
	};

	/**
	 * Video data from ID
	 * @param {string} id
	 * @param {function} callback
	 */
	self.getById = function(id, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParts();

			self.addPart('snippet');
			self.addPart('contentDetails');
			self.addPart('statistics');
			self.addPart('status');

			self.addParam('part', self.getParts());
			self.addParam('id', id);

			self.request(self.getUrl('videos'), callback);
		}
	};




	/**
	 * Get channel info by username, contains channelID, playlist of uploads and likes
	 * @param {string} username
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/channels/list
	 */

	self.getChannelInfoByUsername = function(username, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParts();

			self.addPart('contentDetails');

			self.addParam('part', self.getParts());
			self.addParam('forUsername', username);

			self.request(self.getUrl('channels'), callback);
		}
	}




	/**
	 * Comment Thread from Video Id
	 * @param {string} id
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/commentThreads/list
	 */

	self.getCommentThreadByVideoId = function(id, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParts();

			self.addPart('snippet');

			self.addParam('part', self.getParts());
			self.addParam('videoId', id);

			self.request(self.getUrl('commentThreads'), callback);
		}
	}

	/**
	 * All Comment Thread from Channel Id
	 * @param {string} id
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/commentThreads/list
	 */

	self.getCommentThreadByChannelId = function(id, maxResults, token, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			if (token) {
				self.addParam('pageToken', token);
			} else {
				self.comments = [];
			}
			self.clearParts();

			self.addPart('snippet');

			self.addParam('part', self.getParts());
			self.addParam('maxResults', 100);
			self.addParam('videoId', id);
			console.log("token: ", token);
			console.log("maxResults: ", maxResults);
			console.log("comments length: ", self.comments.length);

			if (self.comments.length < maxResults) {
				self.request(self.getUrl('commentThreads'), function(err, result) {
					console.log(result);
					console.log("result length: ", result.items.length);


					for (var i = 0; i < result.items.length; i++) {
						if (self.comments.length < maxResults) {
							self.comments.push(result.items[i]);
						}
					}

					console.log("nextPageToken: ", result.nextPageToken);
					console.log("current comments length: ", self.comments.length);

					if (result.nextPageToken) {
						self.getCommentThreadByChannelId(id, maxResults, result.nextPageToken, callback);
					} else {
						callback(null, self.comments);
					}
				});

			} else {
				console.log("No next pageToken: ");
				callback(null, self.comments);
			}
		}
	}


	// self.getCommentThreadByChannelId = function(id, maxResults, token, callback) {
	//   var validate = self.validate();

	//   if (validate !== null) {
	//	 callback(validate);
	//   }

	//   else {
	//	 if(token) {
	//		 self.addParam('pageToken', token);
	//	 }
	//	 self.clearParts();

	//	 self.addPart('snippet');

	//	 self.addParam('part', self.getParts());
	//	 self.addParam('maxResults', 100);
	//	 self.addParam('allThreadsRelatedToChannelId', id);
	//	 self.request(self.getUrl('commentThreads'), function(err, result) {
	//		 self.getNextPage(result, self.getCommentThreadByChannelId, [id, maxResults, result.nextPageToken, callback]);
	//	 });
	//   }
	// }


	// self.getNextPage = function(result, func, args) {
	//	 for (var i = 0; i < result.items.length; i++) {
	//		 self.comments.push(result.items[i]);

	//	 }
	//	 console.log(result.nextPageToken);
	//	 console.log(self.comments.length);

	//	 if(result.nextPageToken && self.comments.length < 500) {
	//	   //   console.log(self.comments);
	//	   //   console.log(maxResults);
	//		 func.apply(args);
	//	 }
	//	 else {
	//		 callback(null, self.comments);
	//	 }
	// }

	//
	// self.getNextPage = function(cb, id, max, nextPageToken, callback) {
	//	 cb(id, max, nextPageToken, callback);
	// }

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
			self.clearParts();

			self.addPart('snippet');
			self.addPart('contentDetails');
			self.addPart('status');
			self.addPart('player');
			self.addPart('id');

			self.addParam('part', self.getParts());
			self.addParam('id', id);

			self.request(self.getUrl('playlists'), callback);
		}
	};

	/**
	 * Playlists data from Playlist Id
	 * @param {string} id
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/playlistItems/list
	 */
	self.getPlayListsItemsById = function(id, callback) {
		var validate = self.validate();

		if (validate !== null) {
			callback(validate);
		} else {
			self.clearParts();

			self.addPart('contentDetails');
			self.addPart('id');
			self.addPart('snippet');
			self.addPart('status');

			self.addParam('part', self.getParts());
			self.addParam('playlistId', id);

			self.request(self.getUrl('playlistItems'), callback) {
		}
	};


	/**
	 * Get and process next page from api response
	 * @param {string} id
	 * @param {function} callback
	 * https://developers.google.com/youtube/v3/docs/playlists/list
	 */
	function processResultPages(err, result, url) {

		for (var i = 0; i < body.items.length; i++) {
			if (body.items[i].snippet.title !== 'Private video' && body.items[i].snippet.title !== null && body.items[i].snippet.title !== '') {
				resultSongs.push(body.items[i].snippet.title);
			}
		}
		if (body.nextPageToken) {
			logger.info('nextPageToken given: ' + body.nextPageToken);
			getNextPage(body.nextPageToken, resultSongs, callback);
		} else {
			logger.info('No nextPageToken');
			callback(null, resultSongs);
		}
	}





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
			self.clearParts();

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
			self.clearParts();

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
