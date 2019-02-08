const MutationEvent = function(params) {
	this.checkParams(params);

	this.set_name(params.name);
	this.set_detect(params.detect);
	this.set_callback(params.callback);
};

MutationEvent.prototype = {
	DEFAULT_OPTIONS:{attributes: true, childList: true, characterData: true, subtree: true},
	checkParams(params) {
		let errors = [];
		if (!params) errors.push("Aucun argument fourni");
		else ["name","detect","callback"].forEach(param=>{if (!params[param]) errors.push("L'argument \"" + param + "\" est obligatoire");});
		if (errors.length) throw errors;
	},
	get name() {
		return this._name;
	},
	set_name(value) {
		this._name = value;
	},
	set_detect(detect) {
		if (typeof detect !== "function") throw "L'argument doit être une fonction";
		this.detect = detect;
	},
	set_callback(callback) {
		if (typeof callback !== "function") throw "L'argument doit être une fonction";
		this.callback = callback;
	}
};

module.exports = MutationEvent;
