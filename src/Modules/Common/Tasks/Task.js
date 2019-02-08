const Task = function(params) {
	this.checkParams(params);
	if (!params.hasOwnProperty("taskParams")) params.taskParams = {};

	this.set_id(params.id);
	this.task = params.task;
	this._params = params.taskParams;
	this._result = undefined;
	this.set_state("awaiting");
	this.callback = params.callback;
};

Task.prototype = {
	checkParams(params) {
		let errors = [];
		if (!params) errors.push("Aucun argument fourni");
		else ["task","callback","id"].forEach(param=>{if (!params[param]) errors.push("L'argument \"" + param + "\" est obligatoire");});
		if (Object.getPrototypeOf(params.task).constructor.name !== "AsyncFunction") errors.push("Task doit être une async function");
		if (errors.length) throw errors;
	},
	get id() {
		return this._id;
	},
	get params() {
		return this._params;
	},
	get result() {
		return this._result;
	},
	get state() {
		return this._state;
	},
	set_id(value) {
		this._id = value;
	},
	set_result(value) {
		this._result = value;
	},
	set_state(value) {
		if (["awaiting","processing","finished","error"].includes(value)) this._state = value;
	},
	async process() {
		this.set_state("processing");
		try {
			this.set_result(await this.task(this.params));
			this.set_state("finished");
			if (this.callback) this.callback(this.result);
			TasksManager.remove(this.id);
			TasksManager.processNextTask();
		}catch(error) {
			console.log(error);
			this.set_result(error);
			this.set_state("error");
			TasksManager.pushToErrors(this);
		}
	}
};

module.exports = Task;
