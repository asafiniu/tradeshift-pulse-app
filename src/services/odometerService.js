'use strict';

const _ = require('lodash');

function OdometerService() {
	const service = {};

	var currentVolume = 0;
	window.odometer = document.getElementById('odometer');

	service.addVolume = function(volume) {
		var prev = currentVolume;
		currentVolume += volume;
		_.each(_.range(1, volume), function(i) {
			setTimeout(function(){
				window.odometer.innerHTML = prev + i;
			}, 100);
		});
	}

	return service;
}

module.exports = OdometerService;
