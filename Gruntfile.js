var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');

var AWS = require('aws-sdk')
AWS.config.region = 'us-west-2'

grunt.initConfig({
    lambda_invoke: {
        default: {
        }
    },
    lambda_deploy: {
        default: {
            options: {
                region: 'us-west-2'
            },
            arn: 'arn:aws:lambda:us-west-2:750776760656:function:s3-log-pusher'
        }
    },
    lambda_package: {
        default: {
        }
    }
});

grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
