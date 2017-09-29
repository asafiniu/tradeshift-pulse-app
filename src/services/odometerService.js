'use strict';

const _ = require('lodash');

function OdometerService() {
	const service = {};

	var currentVolume = 0;
	var rate = 173;
	window.odometer = document.getElementById('odometer');

	function commafy(num) {
		var str = num.toString().split('.');
		if (str[0].length >= 4) {
			str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
		}
		if (str[1] && str[1].length >= 5) {
			str[1] = str[1].replace(/(\d{3})/g, '$1 ');
		}

		return str.join('.');
	}

	service.addVolume = function(volume) {
		volume *= rate; // awesome, awesomer, awesomest
		var prev = currentVolume;
		currentVolume += volume;
		_.each(_.range(1, volume), function(i) {
			setTimeout(function(){
				window.odometer.innerHTML = commafy(prev + i);
			}, 400);
		});
	}

	return service;
}

module.exports = OdometerService;
