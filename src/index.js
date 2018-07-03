const { S3 } = require("aws-sdk");
const exporter = require('highcharts-export-server');
const qs = require('qs');
const uuidv1 = require('uuid/v1');

const s3_client = new S3();

function CreateChart(settings) {
    return new Promise((resolve, reject) => {
        exporter.export(settings, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    })
}

exports.handler = async (event) => {
    exporter.initPool();

    let chart_settings
    if (event.params.header["Content-Type"] === "application/x-www-form-urlencoded") {
        chart_settings = qs.parse(event.body);
        chart_settings["options"] = JSON.parse(chart_settings["options"]);
    }
    else {
        chart_settings = JSON.parse(event.body);
    }

    delete chart_settings["async"];

    let ext = chart_settings.split("/").slice(-1)[0];
    let filename = uuidv1() + ext;

    let location;
    try {
        let chart = await CreateChart(chart_settings);
        let data = new Buffer(chart.data, "base64");
        let response = await s3_client.upload({ 
            Bucket: process.env.BUCKETNAME, 
            Key: filename, 
            Body: data,
            ACL: "public-read",  
            ContentDisposition: `attachment; filename='${filename}'` 
        }).promise();
        location = response.Location;
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to save file to S3 bucket" })
        };
    }

    exporter.killPool();

    return {
        statusCode: 200,
        body: JSON.stringify({ title: location })
    };
};