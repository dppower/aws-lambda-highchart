const { S3 } = require("aws-sdk");
const exporter = require('highcharts-export-server');

const s3_client = new S3();

function CreateChart(settings) {
    return new Promise((resolve, reject) => {
        exporter.export(settings, (err, res) =>{
            if (err) return reject(err);
            resolve(res);
        });
    })
}

exports.handler = async (event) => {
    exporter.initPool();

    let chart_settings = JSON.parse(event.body);
    let title = (chart_settings.options && chart_settings.options.title && chart_settings.options.title.text) || `${Date.now()}-test-chart`;

    try {
        let chart = await CreateChart(chart_settings);
        let data = new Buffer(chart.data, "base64");
        await s3_client.putObject({ Bucket: process.env.BUCKETNAME, Key: `${title}.png`, Body: data }).promise();
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
        return {
            statusCode: 500
        };
    }

    exporter.killPool();

    return {
        statusCode: 200
    };
};