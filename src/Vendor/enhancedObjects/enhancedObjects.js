HTMLCollection.prototype.toArray = function() {
	let array = [];
	for (let i=0; i<this.length; i++) {
		array.push(this[i]);
	}
	return array;
};

NodeList.prototype.toArray = function() {
	let array = [];
	for (let i=0; i<this.length; i++) {
		array.push(this[i]);
	}
	return array;
};

DOMTokenList.prototype.toArray = function() {
	let array = [];
	for (let i=0; i<this.length; i++) {
		array.push(this[i]);
	}
	return array;
};

JSON.clone = function(object) {
	return JSON.parse(JSON.stringify(object));
};

HTMLElement.prototype.lehibou_hide = function() {
	if (!this.classList.contains("lehibouHideMe")) this.classList.add("lehibouHideMe");
};

HTMLElement.prototype.lehibou_show = function() {
	if (this.classList.contains("lehibouHideMe")) this.classList.remove("lehibouHideMe");
};

HTMLElement.prototype.findParentNode = function(callback) {
	try {
		if (!callback) throw "Veuillez préciser un callback";
		if (typeof callback !== "function") throw "L'argument callback doit être une fonction";
		let response = this;
		while (!callback(response) && response.tagName !== "HTML") response = response.parentNode;
		return response.tagName === "HTML" ? undefined : response;
	}catch(error) {console.log(error);}
};

String.prototype.capitalize = function(allWords) {
	allWords = typeof allWords !== "boolean" ? false : allWords;
	if (allWords) return this.replace(/\b(\w)(\S*)/gi,(full,one,two)=>{return one.toUpperCase()+two.toLowerCase();});
	return this.replace(/(^\S)([\s\S]*)/gi,(full,one,two)=>{return one.toUpperCase()+two.toLowerCase();});
};
