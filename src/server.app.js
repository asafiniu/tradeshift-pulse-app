const express = require('express')
const app = express()
const serveStatic = require('serve-static')
const path = require('path');
const request = require('request')
const api_host = 'http://10.128.8.130:8080'
const api_path = '/events'

app.use('/', serveStatic(path.join(__dirname, '..')));
app.use('/build', serveStatic(path.join(__dirname, './build')));
app.use('/events/from/:start_time', function(req, res) {
	req.pipe(request(`${api_host}${api_path}?lastseen=${req.params.start_time}`)).pipe(res)
});

app.listen(3000, function () {
	console.log('Tradeshift Pulse listening on port 3000!')
})