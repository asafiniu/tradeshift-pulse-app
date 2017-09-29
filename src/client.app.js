'use strict';

angular.module('TradeshiftPulseApp', [])
	.service('AppService', require('./services/appService'))
	.service('PixiService', require('./services/pixiService'))
	.controller('AppController', require('./controllers/appController'));
