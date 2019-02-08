const TasksManager = function() {
	this._tasks = [];
	this._errors = [];
	this._tasksAdded = 0;
};

TasksManager.prototype = {
	tasks(ids) {
		if (!ids) return this._tasks;
		if (!Array.isArray(ids)) return this.tasks().find(e=>{
			return e.id === ids;
		});
		let response = [];
		ids.forEach(id=>{
			let task = this.tasks.find(e=>{
				return e.id === id;
			});
			if (task) response.push(task);
		});
		return response;
	},
	get errors() {
		return this._errors;
	},
	get tasksAdded() {
		return this._tasksAdded;
	},
	add(params) {
		let errors = [];
		if (!params) errors.push("Aucun argument fourni");
		else ["task","callback"].forEach(param=>{if (!params[param]) errors.push("L'argument \"" + param + "\" est obligatoire");});
		if (errors.length) throw errors;

		let i=1;
		while (this.tasks(i)) i++;
		this._tasks.push(new Modules.Common.Tasks.Task({
			task:params.task,
			callback:params.callback,
			id:i
		}));
		this._tasksAdded ++;
		if (this.tasks().length === 1) this.processNextTask();
	},
	remove(id) {
		if (this.tasks(id)) {
			let index = this.tasks().findIndex(task=>{
				return task.id === id;
			});
			this.tasks().splice(index,1);
		}
	},
	processNextTask() {
		if (this.tasks()[0]) this.tasks()[0].process();
	},
	pushToErrors(task) {
		this._errors.push(task);
		this.remove(task.id);
	}
};

module.exports = TasksManager;
