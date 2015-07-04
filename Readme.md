# What is s3-log-pusher?
s3-log-pusher is an AWS Lambda function that pulls data from the access logs written by S3 static website hosting and forwards those log entries to AWS CloudWatch Logs.

## HOWTO
0. Install grunt command-line: `npm install grunt-cli -g` (you may need to sudo this)
1. Fork this repo and install module by running `npm install` from the project directory.
2. Test with your own data. The event in event.json references my bucket. It won't work for you unless you have access to my account. 
3. I use us-west-2. If you want to change that edit Gruntfile.js.
4. I chose to use the object key as the log stream name. If you want a different name, please change that in the index.js. The function will create the log stream if it does not exist. It will not create the log group.
5. You must create the Lambda function via the AWS Management Console or the AWS API or CLI. You should have it listen to "PutObject" events on the bucket in which your logs are placed. 
6. Run `grunt deploy` to package up the function and deploy it to AWS Lambda.

