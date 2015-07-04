console.log('Loading function')
var aws = require('aws-sdk')
var s3 = new aws.S3()
var log2cw = require('./log2cw.js')
var moment = require('moment')

exports.handler = function(event, context) {
    console.info('received event:', JSON.stringify(event))

    function processLine(line, doneWithLine) {
        var timeStampString = line.match(/\[(.*)\]/)[1]
        console.info('processing log line with timestamp=', timeStampString)
        var logEntry = {
            message: line,
            timestamp: moment(timeStampString, 'DD/MMM/YYYY:HH:mm:ss ZZ').valueOf()
        }
        console.info('processed log line')
        doneWithLine(null, logEntry)
    }

    function done(err, result) {
        if (err)
            return console.error(err)
        console.info('result:', result)
        context.done(null, "log file processed.", result)
    }

    var bucket = event.Records[0].s3.bucket.name
    var key = event.Records[0].s3.object.key

    s3.getObject({Bucket: bucket, Key: key}, function(err, data) {
        if (err) {
            console.error("Error getting object " + key + " from bucket " + bucket +
                ". Make sure they exist and your bucket is in the same region as this function.")
            context.done(null, 'Error', "Error getting file: " + err)
        } else {
            var lines = data.Body.toString().split('\n')
            console.info('The object contains', lines.length, 'lines.')
            lines = lines.filter(function(line) {return line.trim().length > 0})
            console.info('processing', lines.length, 'log entries. The rest were dropped because they are empty.')
            log2cw(lines, bucket, key, processLine, done)
        }
    })
}
