var ospath = require("path");
var child_process = require("child_process");
var fsevents = require("fsevents");
var q = require("q");
var excludes = require("./excludes.js");
var drivecrawler = require("./drivecrawler.js");

var watcher = fsevents("/Users/adrianloh");
var volumes = fsevents("/Volumes");
 
var affector = function(filepath, fileinfo) {
	if (fileinfo.event==="unknown") { return; }
	if (excludes.shouldBeExcluded(fileinfo.path)) { return; }
	if (fileinfo.event.match(/moved-out|deleted/)) {

	} else if (fileinfo.event.match(/moved-in|created/)) {
		if (fileinfo.path.match(/^\/Volumes/)) {
			checkIfDiskImage(fileinfo.path).then(function(isDiskImage) {
				if (!isDiskImage) {
					console.log(fileinfo);
				}
			});
		} else {
			console.log(fileinfo);
		}
	} else if (fileinfo.event.match(/modified/)) {
		console.log(fileinfo);
	} else {

	}
};

function checkIfDiskImage(volumePath) {
	var check = q.defer(),
		cmd = 'diskutil info "#VOLUME" | grep Protocol'.replace(/#VOLUME/, volumePath);
	setTimeout(function() {
		child_process.exec(cmd, function(err, stdout, stderr) {
			if (!err) {
				if (stdout.match(/Disk Image/)) {
					check.resolve(true);
				} else {
					check.resolve(false);
				}
			} else {
				console.error(err);
				check.resolve(true);
			}
		});
	}, 10000);
	return check.promise;
}


watcher.on('change', affector);
volumes.on('change', affector);














