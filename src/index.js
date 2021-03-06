const { S3 } = require("aws-sdk");
const exporter = require('highcharts-export-server');
const qs = require('qs');
const uuidv1 = require('uuid/v1');

const s3_client = new S3();

exporter.initPool({
    maxWorkers: 8,
    initialWorkers: 8,
    workLimit: 20
});

function CreateChart(settings) {
    return new Promise((resolve, reject) => {
        exporter.export(settings, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    })
}

exports.handler = async (event) => {
    let chart_settings;
    let filename;
    try {
        if (event.params.header["Content-Type"] === "application/x-www-form-urlencoded") {
            chart_settings = qs.parse(event.body);
            chart_settings["options"] = JSON.parse(chart_settings["options"]);
        }
        else {
            chart_settings = JSON.parse(event.body);
        }

        delete chart_settings["async"];

        let type = chart_settings.type || "jpeg";
        let ext = type.split("/").slice(-1)[0];
        filename = uuidv1() + "." + ext;
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
        throw new Error(`Invalid: Failed to parse request body.`);
    }
 
    let chart;
    try {
        chart = await CreateChart(chart_settings);
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
        throw new Error(`Invalid: Failed to create chart. Check the chart options.`);
    }

    let public_url;
    try {
        let data = new Buffer(chart.data, "base64");
        let response = await s3_client.upload({ 
            Bucket: process.env.BUCKETNAME, 
            Key: filename, 
            Body: data,
            ACL: "public-read",  
            ContentDisposition: `attachment; filename='${filename}'` 
        }).promise();
        public_url = response.Location;
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
        throw new Error(`Error: Failed to save chart to S3 bucket. Try again later.`);
    }

    return public_url;
};