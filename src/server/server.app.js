const express = require('express')
const app = express()
const serveStatic = require('serve-static');
const path = require('path');
const request = require('request')

app.use('/', serveStatic(path.join(__dirname, '../..')));
app.use('/build', serveStatic(path.join(__dirname, './build')));
app.use('/data/from/:start_time/to/:end_time', function(req, res) {
    req.pipe(request(`http://10.128.10.248:8080/events?lastseen=${req.params.start_time}`)).pipe(res)
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
})