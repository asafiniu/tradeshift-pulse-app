'use strict';

const _ = require('lodash');

function OdometerService() {
	let currentVolume = 0;
	const rate = 173;
	window.odometer = document.getElementById('odometer');

	const service = {};

	service.addVolume = (volume) => {
		volume *= rate; // awesome, awesomer, awesomest
		const prev = currentVolume;
		currentVolume += volume;
		_.each(_.range(1, volume), function(i) {
			setTimeout(function(){
				window.odometer.innerHTML = commafy(prev + i);
			}, 400);
		});
	}

	function commafy(num) {
		const str = num.toString().split('.');
		if (str[0].length >= 4) {
			str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
		}
		if (str[1] && str[1].length >= 5) {
			str[1] = str[1].replace(/(\d{3})/g, '$1 ');
		}

		return str.join('.');
	}

	return service;
}

module.exports = OdometerService;
