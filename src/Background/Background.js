require("dotenv").config();

(async function() {
    require("../Modules/Modules");
    const   $                   =   require("jquery"),
            PageDetectors       =   require("./PageDetectors/PageDetectors"),
            moment              =   require("moment"),
            dropbox_Links       =   {
                                        nonbeta:    process.env.disttimestamp_nonbeta,
                                        beta:       process.env.disttimestamp_beta
                                    },
            LocalHistory        =   {},
            manifest            =   await (await fetch(chrome.runtime.getURL("/manifest.json"))).json(),
            currentTimestamp    =   await (async ()=>{
                                        try {
                                            let response = await (await fetch(chrome.runtime.getURL("/.timestamp"))).text();
                                            return moment(parseInt(response));
                                        }catch(err) {return undefined;}
                                    })(),
            versionCheck        =   async function () {
                let beta = /beta/gi.test(manifest.name);
                if (!dropbox_Links[beta ? "beta" : "nonbeta"]) return true;
                else {
                    let latestTimestamp = moment(
                        parseInt(
                            await (await fetch(dropbox_Links[beta ? "beta" : "nonbeta"])).text()
                        )
                    );
                    for (let timestamp of [currentTimestamp,latestTimestamp]) {
                        if(typeof(timestamp) === "undefined") return false;
                    }
                    return currentTimestamp >= latestTimestamp;
                }
            };

    chrome.tabs.onRemoved.addListener((tabId,removeInfo)=>{
        delete LocalHistory[tabId];
    });

    chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
        if (changeInfo.title||(changeInfo.status && changeInfo.status === "loading")) {
            versionCheck().then(isLatest=>{
                if (!isLatest) {
                    console.error("Old version used");
                    chrome.notifications.create("reminder", {
                        type: "basic",
                        iconUrl: "public/img/Common/logoHibou.png",
                        title: "Ton extension n'est pas à jour !",
                        message: `Une nouvelle version de l'extension est disponible et tu risques d'avoir des bugs si tu ne la rafraichis pas.
                        Vérifie que l'application Dropbox tourne, puis clique sur le logo de l'extension (lehibou) et fais Ctrl+Shift+R.`
                     });
                }
            });

            let detected = {
                    detected: false,
                    module: undefined,
                    page: undefined
                };
            if (!LocalHistory.hasOwnProperty(tabId)) LocalHistory[tabId] = [];
            if (!LocalHistory[tabId][0]||LocalHistory[tabId][LocalHistory[tabId].length-1].url !== tab.url) LocalHistory[tabId].push(tab);
            $.each(PageDetectors, (module,pages)=>{
                $.each(pages, (page,detect)=>{
                    if (detect(LocalHistory[tabId].slice(LocalHistory[tabId].length-2),changeInfo)) detected = {
                        detected: true,
                        module: module,
                        page: page
                    };
                })
            });

            chrome.tabs.executeScript(tabId, {
                code:   `chrome.runtime.sendMessage({
                    title:  "testResults",
                    body: {
                        set:    {
                            TasksManager: window.hasOwnProperty("TasksManager"),
                            MutationsManager: window.hasOwnProperty("MutationsManager"),
                            Modules: window.hasOwnProperty("Modules")
                        },
                        detected: ${JSON.stringify(detected)},
                        controllerType: typeof(PageController) === "undefined" ? undefined : PageController.type
                    }
                });`,
                runAt:"document_start"
            });
        }
    });

    chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
        if (request.hasOwnProperty("title")) {
            switch (request.title) {
                case "testResults" : {
                    if (request.body.detected.detected) require("./DetectorActions/Detected")(Object.assign({},{tab:sender.tab},request.body));
                    else require("./DetectorActions/NotDetected")(Object.assign({},{tab:sender.tab},request.body))
                    break;
                }

                case "fetchGET" : {
                    if (!request.hasOwnProperty("expect") || !["json","text","arrayBuffer"].includes(request.expect)) request.expect = "json";
                    let abortController = new AbortController(),
                        signal = abortController.signal;

                    setTimeout(function(){
                        abortController.abort();
                        console.log("Call aborted");
                        sendResponse({success:false,error:"Call was aborted because it was taking too long to complete"});
                    },5000);

                    fetch(request.url,{signal})
                        .then(response=>{
                            try {
                                let headers = {};
                                for (let entry of response.headers.entries()) headers[entry[0]] = entry[1];

                                if (response instanceof TypeError) throw {success:false,error:response};
                                else if (!response.ok) response.text().then(error=>{sendResponse({success:false,error:error});});
                                else {
                                    response[request.expect]()
                                    .then(final=>{
                                        if (request.expect === "arrayBuffer") final = JSON.stringify(Array.apply(null, new Uint8Array(final)));
                                        sendResponse({
                                            success:true,
                                            response:final,
                                            headers:headers
                                        });
                                    });
                                }
                            }catch(error) {
                                sendResponse({success:false,error:error});
                            }
                        });
                    return true;
                    break;
                }
            }
        }
    });
})();
