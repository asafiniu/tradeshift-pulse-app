'use strict';

const angular = require('angular');

angular.module('TradeshiftPulseApp', [])
	.service('ConstantsService', require('./services/constantsService'))
	.service('EventsService', require('./services/eventsService'))
	.service('MockEventsService', require('./services/mockEventsService'))
	.service('OdometerService', require('./services/odometerService'))
	.service('MapService', require('./services/mapService'))
	.service('EasingUtil', require('./utils/easingUtil'))
	.service('NumberUtil', require('./utils/numberUtil'))
	.service('KeyboardUtil', require('./utils/keyboardUtil'))
	.service('ConnectionModel', require('./models/connectionModel'))
	.controller('AppController', require('./controllers/appController'));
