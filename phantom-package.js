const path = require("path");

/**
 * @type {import("webpack").Configuration}
 */
const config = {   
    entry: {
        "phantomjs-prebuilt": "./node_modules/phantomjs-prebuilt/lib/phantomjs.js"
    },
    mode: "development",
    target: "node",
    output: {
        filename: "[name]/index.js",
        path: path.join(__dirname, "build", "node_modules"),
        libraryTarget: "commonjs"
    }
};

module.exports = config;