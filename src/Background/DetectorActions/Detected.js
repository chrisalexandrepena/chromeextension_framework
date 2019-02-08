const Vendor = require("../../Vendor/vendor.json");

module.exports = function({tab,set,detected,controllerType}) {
    let module = detected.module, page = detected.page;
    if (Object.values(set).includes(false)) {
        let toSet = Object.entries(set).filter(e=>!e[1]).map(e=>e[0]);

        if (toSet.includes("Modules")) chrome.tabs.executeScript(tab.id,{
            file: "Modules.js",
            runAt:"document_start"
        });

        if (toSet.includes("TasksManager")) chrome.tabs.executeScript(tab.id,{
            code: `(function() {
                let setTasksManager = function() {
                        if (typeof(TasksManager) === "undefined") window.TasksManager = new Modules.Common.Tasks.TasksManager();
                    },
                    interval;
                if (typeof(Modules) === "undefined") interval = setInterval(
                    ()=>{
                        if (typeof(Modules) !== "undefined") {
                            clearInterval(interval);
                            setTasksManager();
                        }
                    }
                );
                else setTasksManager();
            })();`,
            runAt:"document_start"
        });

        if (toSet.includes("MutationsManager")) chrome.tabs.executeScript(tab.id,{
            code: `(function() {
                let interval;
                if (typeof(Modules) === "undefined") interval = setInterval(
                    ()=>{
                        if (typeof(Modules) !== "undefined") {
                            clearInterval(interval);
                            if (typeof(MutationsManager) === "undefined") window.MutationsManager = new Modules.Common.Mutations.MutationsManager();;
                        }
                    }
                );
                else if (typeof(MutationsManager) === "undefined") window.MutationsManager = new Modules.Common.Mutations.MutationsManager();
            })();`,
            runAt:"document_start"
        });

    }

    if (!controllerType||controllerType !== `${module}${page}`) {
        Modules[module].info.dependencies.forEach(dependency=>{
            if (Vendor[dependency].hasOwnProperty("js")) {
                Vendor[dependency].js.forEach(script=>{
                    chrome.tabs.executeScript(tab.id,{
                        file:`Vendor/${dependency}/${script}`,
                        runAt:"document_start"
                    });
                });
            }
            if (Vendor[dependency].hasOwnProperty("css")) {
                Vendor[dependency].css.forEach(stylesheet=>{
                    chrome.tabs.insertCSS(tab.id,{
                        file:`Vendor/${dependency}/${stylesheet}`,
                        runAt:"document_start"
                    });
                });
            }
        });
        Modules[module].css.forEach(stylesheet=>{
            chrome.tabs.insertCSS(tab.id,{
                file: `public/css/${module}/${stylesheet}.min.css`,
                runAt:"document_start"
            });
        });
        Modules.Common.css.forEach(stylesheet=>{
            chrome.tabs.insertCSS(tab.id,{
                file: `public/css/Common/${stylesheet}.min.css`,
                runAt:"document_start"
            });
        });
        if (Modules[module].hasOwnProperty("Common")) Modules[module].Common.css.forEach(stylesheet=>{
            chrome.tabs.insertCSS(tab.id,{
                file: `public/css/${module}/Common/${stylesheet}.min.css`,
                runAt:"document_start"
            });
        });
        Modules[module][page].css.forEach(stylesheet=>{
            chrome.tabs.insertCSS(tab.id,{
                file: `public/css/${module}/${page}/${stylesheet}.min.css`,
                runAt:"document_start"
            });
        });
        Modules[module][page].code.forEach(script=>{
            chrome.tabs.executeScript(tab.id,{code:script,runAt:"document_start"});
        });

        chrome.tabs.executeScript(tab.id,{
            code: `
                (function() {
                    if (typeof(PageController) === "undefined"||(PageController.type && PageController.type !== "${module}${page}")) {
                        window.PageController = "coming";
                        if (!document.querySelector(".barebone_loadingScreen")) {
                            let loadingScreen = document.createElement("div"),
                            icon = document.createElement("div");
                            icon.style = 'background-image: url("${chrome.runtime.getURL("/public/img/Common/loading.svg")}");';
                            loadingScreen.className = "barebone_loadingScreen";
                            loadingScreen.appendChild(icon);
                            document.documentElement.appendChild(loadingScreen);
                        }

                        if (typeof(MutationsManager) !== "undefined" && MutationsManager.mutations().length) MutationsManager.empty();
                        if (typeof(TasksManager) !== "undefined" && TasksManager.tasks().length) TasksManager._tasks = [];

                        (new Promise((resolve,reject)=>{
                            let interval = setInterval(
                                ()=>{
                                    if (!(${Modules[module].info.dependencies.includes("APICallers")} && typeof(API) === "undefined") && typeof(Modules) !== "undefined" && document.body) {
                                        clearInterval(interval);
                                        resolve();
                                    }
                                },
                                200
                            );
                        }))
                        .then(()=>new Promise((resolve,reject)=>{
                            if (Modules.${module}.${page}.PageController.prototype.needLocalBDD) {
                                let promises = Object.keys(API)
                                    .filter(key=>API[key].hasOwnProperty("LocalBDDs"))
                                    .map(key=>API[key].LocalBDDs.checkBDD());
                                Promise.all(promises)
                                    .then(resolve)
                                    .catch(reject)
                            }else resolve();
                        }))
                        .then(()=>{
                            window.PageController = new Modules.${module}.${page}.PageController();
                        })
                        .catch(console.error);
                    }
                })();`,
            runAt:"document_start"
        });
    }
};
