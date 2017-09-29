'use strict';

angular.module('TradeshiftPulseApp', [])
	.constant('API_DOMAIN', 'http://localhost:3000')
	.constant('API_POLL_URL', '/data')
	.constant('POLL_TIMEOUT', 1000)
	.constant('MAP_WIDTH', 1280) // SVG
	.constant('MAP_HEIGHT', 800) // SVG
	.service('AppService', ['API_DOMAIN', 'API_POLL_URL', '$http', function(API_DOMAIN, API_POLL_URL, $http) {

		var buildURL = function(from, to) {
			return `${API_DOMAIN}${API_POLL_URL}/from/${from.toISOString()}/to/${to.toISOString()}`;
		};

		/*
		 * poll for data collected between {@fromDate} until {@toDate} (default: now)
		 */
		this.poll = function(fromDate, toDate) {
			if (!fromDate) {
				throw "Missing parameter 'fromDate'";
			}

			fromDate = new Date(fromDate);
			if (!toDate) {
				toDate = new Date();
			}

			return $http.get(buildURL(fromDate, toDate));
		};

	}])
	// .service('PixiService', ['MAP_WIDTH', 'MAP_HEIGHT', function(MAP_WIDTH, MAP_HEIGHT){
		
	// 	var countryToPixiCountry = function(country) {
	// 		return {
	// 			iso: country.iso,
	// 			lat: country.lat,
	// 			lon: country.lon,
	// 			x: ((MAP_WIDTH / 360) * (180 + parseFloat(country.lon))),
	// 			y: ((MAP_HEIGHT / 180) * (90 - parseFloat(country.lat)))
	// 		};
	// 	};

	// 	var eventToPixiEvent = function(event) {
	// 		return {
	// 			source: countryToPixiCountry(event.source),
	// 			dest: countryToPixiCountry(event.dest),
	// 			volume: event.volume
	// 		};
	// 	};

	// 	this.publish = function(events) {
	// 		var pixiEvents = [];
	// 		for (var i = 0; i < events.length; i++) {
	// 			pixiEvents.push(eventToPixiEvent(events[i]));
	// 		}

	// 		// TODO: display events on PixiJS (asaf/jim)
	// 		return pixiEvents;
	// 	};

	// }])
	.service('PixiService', ['MAP_WIDTH', 'MAP_HEIGHT', require('./pixiService')])
	.controller('AppController', ['POLL_TIMEOUT', 'PixiService', 'AppService', '$scope', function(POLL_TIMEOUT, PixiService, AppService, $scope) {

		var lastTimeStamp = new Date();

		$scope.error = function(msg) {
			$scope.errorMessage = msg;
		};

		$scope.poll = function(){
			setTimeout(function(){
				AppService.poll(lastTimeStamp).then(function(response) {
					lastTimeStamp = response.data.end_time; // end of time range already visualized
					$scope.template_path = PixiService.publish(response.data.events);
					setTimeout($scope.poll, POLL_TIMEOUT); // go again
				}).catch(function(error) {
					$scope.error(error);
				});
			}, POLL_TIMEOUT);
		};

		// init function
		(function(){
			// $scope.poll();
			// console.log(PixiService.publish([
			// 	{
			// 		source: {
			// 			iso: 'US',
			// 			lat: '37.09024',
			// 			lon: '-95.712891'
			// 		},
			// 		dest: {
			// 			iso: 'CA',
			// 			lat: '56.130366',
			// 			lon: '-106.346771'
			// 		},
			// 		volume: 123456789
			// 	},
			// 	{
			// 		source: {
			// 			iso: 'CA',
			// 			lat: '56.130366',
			// 			lon: '-106.346771'
			// 		},
			// 		dest: {
			// 			iso: 'US',
			// 			lat: '37.09024',
			// 			lon: '-95.712891'
			// 		},
			// 		volume: 123456789
			// 	},
			// 	{
			// 		source: {
			// 			iso: 'CH',
			// 			lat: '46.818188',
			// 			lon: '8.227512'
			// 		},
			// 		dest: {
			// 			iso: 'CL',
			// 			lat: '-35.675147',
			// 			lon: '-71.542969'
			// 		},
			// 		volume: 123456789
			// 	}
			// ]))
		})();

	}]);
