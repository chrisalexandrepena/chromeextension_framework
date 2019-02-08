(function() {
    let interval = setInterval(
        ()=>{
            if (document.head) {
                clearInterval(interval);
                let styleSheet = document.createElement("link");
                styleSheet.setAttribute("rel","stylesheet");
                styleSheet.setAttribute("href","https://use.fontawesome.com/releases/v5.3.1/css/all.css");
                styleSheet.setAttribute("integrity","sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU");
                styleSheet.setAttribute("crossorigin","anonymous");
                document.head.appendChild(styleSheet);
            }
        },
        200
    );
})();
