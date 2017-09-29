var angularserver = require('angularjs-server');
var path = require('path');
var fs = require('fs');
var express = require('express');
var request = require('request')

var templateFile = path.join(__dirname, 'index.html');
var template = fs.readFileSync(templateFile, {encoding:'utf8'});
var app = express();

// Server initialization
angularserver.Server({
    template: template,
    serverScripts: [
        path.join(__dirname, 'node_modules/angular/angular.js'),
        path.join(__dirname, 'client.js')
    ],
    clientScripts: [
        '/:static/node_modules/angular/angular.js',
        '/:static/node_modules/angular-route/angular-route.js',
        '/:static/client.js'
    ],
    angularModules: [
        'TradeshiftPulseApp'
    ]
});

// Routes
app.use('/', express.static(__dirname));
app.use('/data/from/:start_time/to/:end_time', function(req, res) {
    req.pipe(request(`http://10.128.10.248:8080/events?lastseen=${req.params.start_time}`)).pipe(res)
});

// Run
app.listen(3000);
console.log('listening on port 3000');