const   PageController  = function() {
    let self = this,
        interval;
    self._type = "GoogleHome";
    interval = setInterval(
        ()=>{
            let targets = document.querySelectorAll('input[value="Recherche Google"]');
            if (targets.length >= 2) {
                clearInterval(interval);
                self.insertButtons(Array.from(targets).map(e=>e.parentNode));
                self.remove_loadingScreen();
            }
        },
        500
    );
};

PageController.prototype = {
    add_loadingScreen(){
        let loadingScreen = document.getElementsByClassName("barebone_loadingScreen");
        if (!loadingScreen[0]) {
            loadingScreen = document.createElement("div");
            let icon = document.createElement("div");
            icon.style = `background-image: url("${chrome.runtime.getURL("/public/img/Common/91.svg")}");`;
            loadingScreen.className = "barebone_loadingScreen";
            loadingScreen.appendChild(icon);
            document.documentElement.appendChild(loadingScreen);
        }
    },
    remove_loadingScreen() {
        let loadingScreen = document.getElementsByClassName("barebone_loadingScreen");
        if (loadingScreen[0]) loadingScreen[0].remove();
    },
    insertButtons(targets) {
        for (let target of targets) {
            let button = document.createElement("input");
            button.value = "Useless New Button =)";
            button.setAttribute("aria-label","Useless New Button =)");
            button.type = "submit";
            button.name = "btnUseless";
            button.addEventListener("click",()=>alert("I'm useless!"));
            button.setAttribute("title","This is just a useless button added for fun");
            tippy(button,{size:"large",placement:"bottom"});
            target.appendChild(button);
        }
    },
    get type() {
        return this._type;
    }
};
module.exports = PageController;
