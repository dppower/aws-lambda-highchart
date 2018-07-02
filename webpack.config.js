const path = require("path");

/**
 * @type {import("webpack").Configuration}
 */
const config = {   
    entry: {
        "highchart-s3": "./src/index.js"
    },
    mode: "development",
    externals: {
        "aws-sdk":  {
            commonjs: "aws-sdk"
        },
        "phantomjs-prebuilt": {
            commonjs: "phantomjs-prebuilt"
        }
    },
    target: "node",
    output: {
        filename: "index.js",
        path: path.join(__dirname, "build"),
        libraryTarget: "commonjs"
    }
};

module.exports = config;