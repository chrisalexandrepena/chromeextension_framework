module.exports = {
	Home: function(tabs,changeInfo) {
		let newTab = tabs[1] ? tabs[1] : tabs[0];
		if (/^https:\/\/www\.google\.[^.]+\/?$/gi.test(newTab.url)) return true;
		return false;
	}
};
