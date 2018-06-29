const path = require("path");

/**
 * @type {import("webpack").Configuration}
 */
const config = {   
    entry: {
        "highchart-s3": "./src/highchart-s3/index.js"
    },
    mode: "production",
    externals: {
        "aws-sdk":  {
            commonjs: "aws-sdk"
        }
    },
    target: "node",
    output: {
        filename: "[name]/index.js",
        path: path.join(__dirname, "build"),
        libraryTarget: "commonjs"
    }
};

module.exports = config;