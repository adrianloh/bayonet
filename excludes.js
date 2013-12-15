var path = require('path');

module.exports = (function () {
	var self = {},
		excludeFiles = [
			'Thumbs.db',
			'TheVolumeSettingsFolder',
			'System Volume Information',
			'System',
			'Library',
			'node_modules',
			'Final Cut Events',
			'Final Cut Projects',
			'Cache',
			'Caches',
			'lib',
			'tmp',
			'temp',
			'Album Artwork',
			'Cloud Purchases',
			'Audio Render Files',
			'Capture Scratch',
			'Render Files',
			'Thumbnail Media',
			'Thumbnail Cache Files',
			'Waveform Cache Files',
			'untitled folder'
		].join("|"),
		re = new RegExp('^('+ excludeFiles + ')$');

	self.shouldBeExcluded  = function(filepath) {
		return filepath.split(path.sep).filter(function(part) {
			// Also exclude dotfiles
			return (part.match(/^\.|\$/) || part.match(re));
		}).length>0;
	};

	return self;

})();