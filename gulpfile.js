require("dotenv").config();
const   gulp            = require("gulp"),
        rename          = require("gulp-rename"),
        minifyCSS       = require("gulp-clean-css"),
        pathParser      = require("path"),
        {execSync}      = require("child_process"),
        {spawn}     = require("child_process"),
        browserify      = require("browserify"),
        source          = require("vinyl-source-stream"),
        fs              = require("fs"),
        del             = require("del"),
        paths           = {
            base: ""
        },
        distantFolders  = {
            beta:       process.env.distfolder_beta,        // rclone path to dropbox/drive/etc of beta extension
            nonbeta:    process.env.distfolder_nonbeta      // rclone path to dropbox/drive/etc of non beta extension
        };

let dependencies = ["APICallers"];

(function getPaths(){
    let websiteDir = /(^.+\/Websites)\//gi.exec(__dirname);
    paths.base = websiteDir ? websiteDir[1] : undefined;
    if (!paths.base) throw new Error("Aucun dossier Websites détecté");
    for (let dep of dependencies) {
        paths[dep] = execSync(
            `find ${paths.base} -type d -name ${dep}`,
            {encoding:"utf8"}
        ).split("\n").find(path=>!/\/src\//gi.test(path)&&!/\/vendor\//gi.test(path));
        if (!paths[dep]) throw new Error(`Aucun dossier trouvé pour la dépendance "${dep}"`);
    }
})();

function movecss(cb) {
    fs.readdir("src/Modules/", (err, results) => {
        results.forEach(result => {
            fs.stat("src/Modules/" + result, (err, stats) => {
                if (stats.isDirectory()) {
                    gulp.src(`src/Modules/${result}/public/css/**/*.css`)
                        .pipe(minifyCSS())
                        .pipe(rename({
                            extname: ".min.css"
                        }))
                        .pipe(gulp.dest(`build/public/css/${result}/`));
                }
            });
        });
    });
    cb();
}

function deletebuild(cb) {
    del.sync("./build");
    cb();
}

function addtimestamp(cb) {
    fs.writeFileSync("./build/.timestamp",Date.now());
    cb();
}

function moveimg(cb) {
    fs.readdir("src/Modules/", (err, results) => {
        results.forEach(result => {
            fs.stat("src/Modules/" + result, (err, stats) => {
                if (stats.isDirectory()) {
                    gulp.src(`src/Modules/${result}/public/img/**/*.{png,git,jpeg,svg,jpg}`)
                    .pipe(gulp.dest(`build/public/img/${result}/`));
                }
            });
        });
    });
    cb();
}

function movehtml(cb) {
    fs.readdir("src/Modules/", (err, results) => {
        results.forEach(result => {
            fs.stat("src/Modules/" + result, (err, stats) => {
                if (stats.isDirectory()) {
                    gulp.src(`src/Modules/${result}/public/html/**/*.html`)
                    .pipe(gulp.dest(`build/public/html/${result}/`));
                }
            });
        });
    });
    cb();
}

function movejs(cb) {
    if (!fs.existsSync("build")) fs.mkdirSync("build");
    gulp.src("src/manifest.json")
        .pipe(gulp.dest("./build/"));

    browserify("src/Modules/Modules.js")
        .bundle()
        .pipe(source("Modules.js"))
        .pipe(gulp.dest("build/"));

    browserify("src/Background/Background.js")
        .bundle()
        .pipe(source("Background.js"))
        .pipe(gulp.dest("build/"));

    fs.readdir("src/Modules/", (err, results) => {
        results.forEach(result => {
            fs.stat("src/Modules/" + result, (err, stats) => {
                if (stats.isDirectory()) {
                    gulp.src(`src/Modules/${result}/public/js/**/*.{js,json}`)
                    .pipe(gulp.dest(`build/public/js/${result}/`));
                }
            });
        });
    });
    cb();
}

function getdependencies(cb) {
    for (let dep of dependencies) {
        if (fs.existsSync(pathParser.join(__dirname,`src/Vendor/${dep}`))) del.sync(pathParser.join(__dirname,`src/Vendor/${dep}`));
        if (fs.existsSync(pathParser.join(paths[dep],"build"))) {
            gulp
                .src(pathParser.join(paths[dep],"build/**/*"))
                .pipe(gulp.dest(pathParser.join(__dirname,`src/Vendor/${dep}`)));
        }else if (fs.existsSync(pathParser.join(paths[dep],"src"))) {
            gulp
                .src(pathParser.join(paths[dep],"src/**/*"))
                .pipe(gulp.dest(pathParser.join(__dirname,`src/Vendor/${dep}`)));
        }
    }
    let interval = setInterval(
        ()=>{
            if (dependencies.reduce(
                (accumulator,current)=>{
                    if (fs.existsSync(pathParser.join("src/Vendor",current))) return accumulator + 1;
                    else return accumulator;
                },
                0
            ) === dependencies.length) {
                clearInterval(interval);
                cb();
            }
        },
        500
    );
}

function sync(type) {
    if (fs.existsSync("./build/manifest.json")) {
        let manifest = JSON.parse(fs.readFileSync("./build/manifest.json"));
        manifest.name = `Nouvelle Extension LeHibou${type === "beta" ? " (Beta)" : ""}`;
        manifest.browser_action.default_title = manifest.name;
        fs.writeFileSync("./build/manifest.json",JSON.stringify(manifest));
        let response = spawn(
                "rclone",
                [
                    "sync",
                    "-u",
                    `${__dirname}/build/`,
                    distantFolders[type === "beta" ? "beta" : "nonbeta"],
                    "--stats",
                    "1s",
                    "--stats-log-level",
                    "NOTICE"
                ]
            );
        response.stderr.setEncoding("utf8");
        return response;
    }
}

gulp.task("syncAll",cb=>{
    console.clear();
    console.log("Preparing to sync...");

    let first = sync();
    first.stderr.on("data",data=>{
        console.clear();
        console.log(`Working on non beta :\n${data}`);
    });
    first.on("exit",()=>{
        let second = sync("beta");
        second.stderr.on("data",data=>{
            console.clear();
            console.log(`Working on beta :\n${data}`);
        });
        second.on("exit",()=>{
            console.log("Finished syncing");
            cb();
        });
    });
});

gulp.task("syncBeta",cb=>{
    console.clear();
    console.log("Preparing to sync...");

    let first = sync("beta");
    first.stderr.on("data",data=>{
        console.clear();
        console.log(`Working on beta :\n${data}`);
    });
    first.on("exit",()=>{
        console.log("Finished syncing");
        cb();
    });
});

function movevendor(cb) {
    del.sync("build/Vendor");
    gulp.src("src/Vendor/**/*")
        .pipe(gulp.dest("build/Vendor/"));
    cb();
}

gulp.task("watch",function(){
    gulp.watch(
        [
            "src/Background/**/*.{js,json,css,png,git,jpeg,svg,html}",
            "src/Modules/**/*.{js,json,css,png,git,jpeg,svg,html}",
            "src/Vendor/**/*.{js,json,css,png,git,jpeg,svg,html}",
            "src/manifest.json"
        ],
        gulp.series(deletebuild,movejs,movecss,moveimg,movehtml,movevendor,addtimestamp)
    );
    for (let dep of dependencies) {
        if (fs.existsSync(pathParser.join(paths[dep],"build"))) {
            gulp.watch(
                pathParser.join(paths[dep],"build/**/*"),
                gulp.series(getdependencies,movevendor,addtimestamp)
            );
        }else if (fs.existsSync(pathParser.join(paths[dep],"src"))) {
            gulp.watch(
                pathParser.join(paths[dep],"src/**/*"),
                gulp.series(getdependencies,movevendor,addtimestamp)
            );
        }
    }
});

exports.default = gulp.series(deletebuild,getdependencies,movejs,movecss,moveimg,movehtml,movevendor,addtimestamp);
