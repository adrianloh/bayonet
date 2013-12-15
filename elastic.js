var moment = require("moment");
var fs = require("fs");
var path = require("path");
var e = require('events');
var request = require("request");
var crypto = require('crypto');
var URLSafeBase64 = require('urlsafe-base64');

/* 
	curl -X PUT http://localhost:9200/spotlight4/ -d "@/Users/adrianloh/Desktop/settings.json"
	curl -X PUT http://localhost:9200/spotlight4/file/_mapping -d "@/Users/adrianloh/Desktop/mapping.json"
*/

function toElasticTimeFormat (stattime) {
	moment(stattime).format();
}

function hash (filepath) {
	return URLSafeBase64.encode(crypto.createHmac("sha1","lohwaikeong").update(filepath).digest());
}

module.exports = (function() {

	var self = new e.EventEmitter(),
		bulkTimeout = setTimeout(function () {}),
		buffer = [], bufferBusy = false;

	function flush() {
		if (buffer.length===0) { 
			return; 
		} else {
			bufferBusy = true;
		}
		var data = {
			url: "http://localhost:9200/bayonet/file/_bulk",
			method: "POST",
			body: buffer.reduce(function(S,o) { 
					return S+=JSON.stringify(o)+"\n";
				},"")+"\n"
		};
		buffer.splice(0,10000000);
		bufferBusy = false;
		request(data, function (err, res) {
			if (err) {
				console.log(err);
			}
		});
	}

	function push(stat) {
		clearTimeout(bulkTimeout);
		var _this = this,
			o = {},
			action = stat.action,
			action_and_meta = {}, checkBufferBusy;
		o.name = stat.name;
		o.fullpath = path.dirname(stat.fullpath);
		o.type = stat.type;
		o.size = stat.size;
		o.atime = moment(stat.atime).format("YYYY-MM-DD HH:mm:ss");
		o.mtime = moment(stat.mtime).format("YYYY-MM-DD HH:mm:ss");
		o.ctime = moment(stat.ctime).format("YYYY-MM-DD HH:mm:ss");
		if (o.type==='f') { 
			o.mime = path.extname(stat.name).slice(1).toLowerCase();
		}
		checkBufferBusy = setInterval(function() {
			if (!bufferBusy) {
				clearInterval(checkBufferBusy);
				action_and_meta[action] = {
					_id: hash(stat.fullpath)
				};
				buffer.push(action_and_meta);
				buffer.push(o);
				if (buffer.length>=6000) {
					flush();
				} else {
					bulkTimeout = setTimeout(function() {
						if (!bufferBusy) {
							flush();
						}
					}, 5000);
				}
			}
		}, 500);
	}

	self.on("push", push);
	
	return self;

})();