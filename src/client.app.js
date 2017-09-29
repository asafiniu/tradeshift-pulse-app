'use strict';

angular.module('TradeshiftPulseApp', [])
	.service('AppService', require('./services/appService'))
	.service('PixiService', require('./services/pixiService'))
	.service('OdometerService', require('./services/odometerService'))
	.controller('AppController', require('./controllers/appController'));
