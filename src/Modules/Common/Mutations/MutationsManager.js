const MutationsManager = function() {
	this._mutations = [];
};

MutationsManager.prototype = {
	mutations(names) {
		if (!names) return this._mutations;
		if (!Array.isArray(names)) return this.mutations().find(e=>{
			return e.name === names;
		});

		let response = [];
		names.forEach(name=>{
            let mutation = this.mutations().find(e=>e.name === name);
			if (mutation) response.push(mutation);
		});
		return response;
	},
	add(params, observe) {
		let errors = [],
			events = params.events ? params.events : [];
		if (!params) errors.push("Aucun argument fourni");
		else ["name","node"].forEach(param=>{if (!params[param]) errors.push("L'argument \"" + param + "\" est obligatoire");});
		if (errors.length) throw errors;

        observe = observe ? true : false;

		if (!this.mutations(params.name)) {
			this.mutations().push(new Modules.Common.Mutations.Mutation({
				name: params.name,
				events: events,
				node: params.node,
				options: params.options ? params.options : undefined
			},observe));
		}
	},
    remove(name) {
        if (name) {
            let index = this.mutations().findIndex(e=>{return e.name === name;});
            if (index !== -1) {
                this.mutations(name).set_state("inactive");
                this.mutations().splice(index,1);
            }
        }
	},
	disconnectAll() {
		this.mutations().forEach(mutation=>{
			mutation.set_state("inactive");
		});
	},
	empty() {
		this.disconnectAll();
		this._mutations = [];
	}
};

module.exports = MutationsManager;
