if (!window.hasOwnProperty("fontAwesomeLoaderInterval")) window.fontAwesomeLoaderInterval = setInterval(
	function() {
		if (document.head) {
			clearInterval(window.fontAwesomeLoaderInterval);
			window.fontAwesomeLoaderInterval = "done";
			let stylesheets = ["jquery-ui","jquery-ui.structure","jquery-ui.theme"];
			for (let sheet of stylesheets) {
				let link = document.createElement("link");

				link.rel = "stylesheet";
				link.href = chrome.runtime.getURL(`/Vendor/jquery-ui/${sheet}.min.css`);

				document.head.appendChild(link);
			}
		}
	},
	200
);
