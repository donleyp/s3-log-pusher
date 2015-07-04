var aws = require('aws-sdk')
var cwl = new aws.CloudWatchLogs()
var async = require('async')

module.exports = function(lines, logGroupName, logStreamName, line2LogEvent, callback) {
    console.info('processing log file with length=', lines.length, ', logGroupName=', logGroupName, ', logStreamName=', logStreamName)
    async.waterfall([
        function getSequenceToken(next) {
            console.info('describing streams')
            cwl.describeLogStreams({logGroupName: logGroupName, logStreamNamePrefix: logStreamName}, function(err, logStreamData) {
                if(err) 
                    return next(err)

                if (logStreamData.logStreams.length == 0) {
                    console.info(logStreamName, 'not found. Creating it.')
                    cwl.createLogStream({logGroupName: logGroupName, logStreamName: logStreamName}, function(err, createLogStreamData) {
                        if (err)
                            return next(err)
                        getSequenceToken(next)
                    })
                }
                else {
                    console.info(logStreamName, 'found. sequenceToken = ', logStreamData.logStreams[0].uploadSequenceToken)
                    next(null, logStreamData.logStreams[0].uploadSequenceToken)
                }
            })
        },
        function processLines(sequenceToken, next) {
            console.info('processing ', lines.length, ' log entries.')
            async.map(lines, line2LogEvent, function linesProcessed(err, logEvents) {
                if(err) {
                    return next(err)
                }

                next(null, sequenceToken, logEvents)
            })
        },
        function putLogs(sequenceToken, logEvents, next) {
            console.info('logging ', logEvents.length, ' events to ', logGroupName, '/', logStreamName)
            // console.debug('logEvents = ', logEvents)

            var putLogsParams = {
                logEvents: logEvents,
                logGroupName: logGroupName,
                logStreamName: logStreamName,
                sequenceToken: sequenceToken
            }
            cwl.putLogEvents(putLogsParams, function logsPlaced(err, putLogEventsResult) {
                if(err)
                    return next(err)

                console.info('log file processed. rejection info: ', putLogEventsResult.rejectedLogEventsInfo || 'none')
                next(null, putLogEventsResult)
            })
        } 
    ], callback)
}
