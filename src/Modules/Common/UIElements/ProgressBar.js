const ProgressBar = function(id,value) {
    let self = this;
    if (!id) id = self.randomString();
    while (document.getElementById(id)) self.randomString();
    value = value ? value : false;

    self._nodes = {
        bar:    $(document.createElement("div")),
        label:  $(document.createElement("div"))
    };
    self.set_id(id);
    self.label.attr("class", "progress-label");

    self.bar.append(self.label);
    self.bar.progressbar({
        value: false,
        change: function() {
            self.label.text(self.bar.progressbar("value") ? Math.round(self.bar.progressbar("value")) + "%" : "");
        }
    });
    self.set_value(value);
};

ProgressBar.prototype = {
	get bar() {
		return this._nodes.bar;
	},
	get label() {
		return this._nodes.label;
	},
	get id() {
		return this._id;
	},
	set_value(value) {
		if (!value) value = false;
		this.bar.progressbar({value:value});
	},
	set_id(id) {
		if (document.getElementById(id)) throw "L'id " + id + " est déjà utilisée";
		this._id = id;
		this.bar.id = this.id;
	},
	toggle() {
		this.bar.classList.toggle("lehibouHideMe");
	},
    randomString(length) {
        length = length||length === 0 ? length : 15;
        let alpha = "abcdefghijklmnopqrstuvwxyz",
            response = "";
        for (let i = 0; i<length; i++) {
            response += alpha[Math.round(Math.random()*25)];
        }
        return response;
    }
};

module.exports = ProgressBar;
