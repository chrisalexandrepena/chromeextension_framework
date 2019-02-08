const Mutation = function(params,observe) {
	this.checkParams(params);

	this.set_name(params.name);
	this.set_observer();
	this._events = [];

	if (params.events) this.add_events(params.events);

	this.set_node(params.node);
	this._options = params.options ? params.options : this.DEFAULT_OPTIONS;
	this.set_state("inactive");

	if (observe) this.toggle();
};

Mutation.prototype = {
	DEFAULT_OPTIONS:{attributes: true, childList: true, characterData: true, subtree: true},
	checkParams(params) {
		let errors = [];
		if (!params) errors.push("Aucun argument fourni");
		else ["name","node"].forEach(param=>{if (!params[param]) errors.push("L'argument \"" + param + "\" est obligatoire");});
		if (errors.length) throw errors;
	},
	get name() {
		return this._name;
	},
	get observer() {
		return this._observer;
	},
	events(names) {
		if (!names) return this._events;
		if (!Array.isArray(names)) return this.events().find(e=>e.name === name);

		let response = [];
		names.forEach(name=>{
            let event = this.events().find(e=>e.name === name);
			if (event) response.push(event);
		});
		return response;
	},
	get state() {
		return this._state;
	},
	get node() {
		return this._node;
	},
	get options() {
		return this._options;
	},
	set_name(value) {
		this._name = value;
	},
	set_observer() {
		this._observer = new MutationObserver(mutations=>{
			this.events().forEach(event=>{
				let response = event.detect(mutations);
				if (response) event.callback(response);
			});
		});
	},
	set_state(value) {
		if (!["active","inactive"].includes(value)) throw "State ne peut être Active ou Inactive";
		this._state = value;
		switch(this.state) {
			case "active":
				this.observer.observe(this.node,this.options);
			break;

			case "inactive":
				this.observer.disconnect();
			break;
		}
	},
	set_node(value) {
		this._node = value;
	},
	set_options(value) {
		this._options = value;
	},
	toggle() {
		this.set_state(this.state === "inactive" ? "active" : "inactive");
	},
	add_events(events) {
		if (!Array.isArray(events)) events = [events];
		events.forEach(event=>{
			if (!(event instanceof Modules.Common.Mutations.MutationEvent)) throw new Error("Mauvais argument");
			if (this.events(event.name)) throw `Le nom ${event.name} est déjà utilisé`;
	        this.events().push(event);
		});
	}
};

module.exports = Mutation;
