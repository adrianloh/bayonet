var fs = require("fs");
var e = require('events');
var path = require('path');
var excludes = require("./excludes.js");
var elastic = require("./elastic.js");

module.exports = (function () {

	var self = {};
	var crawl = new e.EventEmitter();
	var eReadDir = "readdir";
	var eAddFile = "addfile";

	self.add = function (root) {
		crawl.emit(eReadDir, root);
	};

	crawl.on(eReadDir, function (root) {
		fs.readdir(root, function (err, filenames) {
			if (!err && filenames.indexOf(".donotrender")<0) {
				filenames.forEach(function (fn) {
					var rp = path.join(root,fn);
					if (excludes.shouldBeExcluded(rp)) { return; }
					fs.lstat(rp, function (err, stat) {
						if (!err && !stat.isSymbolicLink()) {
							stat.name = fn;
							stat.fullpath = rp;
							stat.action = "create";
							if (stat.isDirectory() && 
								(rp.match(/\./g)===null || rp.match(/\./g).length>1)) {
								crawl.emit(eReadDir, rp);
								stat.type = 'd';
							} else {
								stat.type = 'f';
							}
							elastic.emit("push", stat);
						}
					});
				});
			}
		});
	});

	return self;

})();

["/Volumes/BigMama", "/Volumes/Harriet"].forEach(function(fn) {
	module.exports.add(fn);
});