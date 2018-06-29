const { S3 } = require("aws-sdk");
const exporter = require('highcharts-export-server');

const s3_client = new S3();

exporter.initPool();

function CreateChart(settings) {
    return new Promise((resolve, reject) => {
        exporter.export(settings, (err, res) =>{
            if (err) return reject(err);
            resolve(res);
        });
    })
}

exports.handler = async (event) => {

    const chart_settings = {
        type: 'png',
        options: {
            title: {
                text: 'My Chart'
            },
            xAxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            series: [
                {
                    type: 'line',
                    data: [1, 3, 2, 4]
                },
                {
                    type: 'line',
                    data: [5, 3, 4, 2]
                }
            ]
        }
    };

    try {
        let chart = await CreateChart(chart_settings);
        await s3_client.putObject({ Bucket: "dppower-bucket", Key: `my_chart.png`, Body: chart.data }).promise();
    }
    catch (e) {
        console.log(`error: ${JSON.stringify(e)}`);
    }
};