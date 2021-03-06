var path = require('path'),
    task = require('vsts-task-lib/task'),
    shelljs = require('shelljs'),
    fs = require('fs'),
    http = require('https');

var environment = task.getInput('environment', true);
var username = task.getInput('username', true) + "@" + environment;
var password = task.getVariable('password');
var applicationName = task.getInput('applicationname', true);
var fileName = task.getInput('filename', true);
var folder = task.getPathInput('filepath', true).replace(/\"/g, "");
//var fileName = 'mstest-1.0.0-SNAPSHOT.zip';
var fullFilePath = path.join(folder, fileName);
task._writeLine('Full path: ' + fullFilePath);
var zipFile = fs.readFileSync(fullFilePath);

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
var header = {'Authorization': auth}

task._writeLine('File Byte Count: ' + zipFile.byteLength);
task._writeLine('Deploying ' + fileName);

var req = http.request({
    method: "POST",
    host: 'anypoint.mulesoft.com',
    path: '/cloudhub/api/applications/'+ applicationName +'/deploy',
    headers: header
}, function(response){
    var responseMessage = response.statusCode + ' ' + response.statusMessage;
    if (response.statusCode == 200) {
        task._writeLine(responseMessage + ' - Application Deployed Successfully')
    }
    else {
        task.setResult(task.TaskResult.Failed, responseMessage);
    }
}).on('error', function(error){
    var responseMessage = error.name + ' ERROR: ' + error.message;
    task.setResult(task.TaskResult.Failed, responseMessage);
    // task._writeLine(responseMessage);
    // throw responseMessage;
});

req.write(zipFile);
req.end();

// tfx extension create --manifest-globs vss-extension.json

    
