'use strict';

const _ = require('lodash');
const moment = require('moment');
const Connection = require('../models/Connection');
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 800;

function PixiService() {
	const stage = new PIXI.Stage(0x000000);

	const myView = document.getElementById('map');
	const renderer = PIXI.autoDetectRenderer(MAP_WIDTH, MAP_HEIGHT, {antialiasing: true, transparent: true, resolution: 1});
	myView.appendChild(renderer.view);
	myView.parentElement.style.width = MAP_WIDTH + 'px';

	const locationNames = _.range(100);
	const locations = getRandomLocations();
	let connections = [];

	const service = {};

	const connectionColors = [0x00B0FF, 0xFCBF12, 0x4FC610, 0xF2F2F2];

	mainLoop();

	// console.log(JSON.stringify(locations, null, '\t'));

	function getRandomLocationNamePair() {
		const firstIndex = getRandomInt(0, locationNames.length - 1);
		const firstName = locationNames[firstIndex];
		const otherNames = _.reduce(locationNames, (data, locationName) => {
			if (locationName !== firstName) {
				data.push(locationName);
			}
			return data;
		}, []);
		// console.log('locationNames', locationNames, 'otherNames', otherNames);
		const secondIndex = getRandomInt(0, otherNames.length - 1);
		const secondName = otherNames[secondIndex];
		const result = { firstName, secondName };
		// console.log('getRandomLocationNamePair', JSON.stringify(result, null, '\t'));
		return result;
	}

	function getRandomLocations() {
		return _.reduce(locationNames, (data, locationName) => {
			console.log('locationName', locationName);
			return _.assign({}, data, {
				[locationName]: getRandomPoint(),
			});
		}, {});
	}

	const events = _.reduce(_.range(50), (data, value) => {
		const gap = getRandomInt(0, 1);
		let nextMoment = _.isNil(data.lastMoment) ? moment() : moment(data.lastMoment);
		nextMoment = nextMoment.add(gap, 'seconds');
		const locationPair = getRandomLocationNamePair();
		data.events.push({
			timestamp: nextMoment.valueOf(),
			sourceLocationName: locationPair.firstName,
			targetLocationName: locationPair.secondName,
		});
		data.lastMoment = nextMoment;
		return data;
	}, { events: [], lastMoment: null }).events;

	// console.log(JSON.stringify(events, null, '\t'));

	_.each(events, ({ sourceLocationName, targetLocationName, timestamp }) => {
		// console.log('sourceLocationName', sourceLocationName, 'targetLocationName', targetLocationName);
		const srcPoint = locations[sourceLocationName];
		const dstPoint = locations[targetLocationName];
		// console.log('srcPoint', JSON.stringify(srcPoint, null, '\t'));
		// console.log('dstPoint', JSON.stringify(dstPoint, null, '\t'));
		const color = getNextColor();
		const volume = getRandomInt(3, 15);
		const connection = new Connection({ srcPoint, dstPoint, timestamp, color, volume });
		connections.push(connection);
	});

	function mainLoop() {
		const currentTimestamp = moment().valueOf();
		_.each(connections, (connection) => {
			// console.log('connection.getTimestamp()', connection.getTimestamp());
			// console.log('connection.isOnStage()', connection.isOnStage());
			// console.log('connection.isOlderThan(currentMoment)', connection.isOlderThan(currentMoment));
			if ((connection.isOlderThan(currentTimestamp)) && (!connection.isOnStage()) && (!connection.isComplete())) {
				connection.addToStage(stage);
			}
			if (connection.isOnStage()) {
				connection.update();
				if (connection.isComplete()) {
					connection.removeFromStage(stage);
				}
			}
		});
		connections = _.remove(connections, (connection) => !connection.isComplete());
		renderer.render(stage);
		requestAnimationFrame(mainLoop);
	}

	function getNextColor() {
		return connectionColors[getRandomInt(0, connectionColors.length)];
	}

	function getRandomInt(min, max) {
		const int = Math.floor(Math.random() * (max - min + 1)) + min;
		return int;
	}

	function getRandomPoint() {
		return {
			x: getRandomInt(0, MAP_WIDTH),
			y: getRandomInt(0, MAP_HEIGHT),
		};
	}

	function countryToPixiCountry(country) {
		return {
			iso: country.iso,
			lat: country.lat,
			lon: country.lon,
			x: ((MAP_WIDTH / 360) * (180 + parseFloat(country.lon))),
			y: ((MAP_HEIGHT / 180) * (90 - parseFloat(country.lat)))
		};
	};

	function eventToPixiEvent(event) {
		return {
			source: countryToPixiCountry(event.source),
			dest: countryToPixiCountry(event.dest),
			volume: event.volume,
			// added
			// timestamp: moment().valueOf(),
		};
	};

	service.publish = function(events) {
		// events = [
		// 	{
		// 		source: {iso: 'US', lat: '37.09024', lon: '-95.712891'},
		// 		dest: {iso: 'CA', lat: '56.130366', lon: '-106.346771'},
		// 		volume: 12305918750980980
		// 	}, {
		// 		source: {iso: 'CA', lat: '56.130366', lon: '-106.346771'},
		// 		dest: {iso: 'US', lat: '37.09024', lon: '-95.712891'},
		// 		volume: 233235325
		// 	}, {
		// 		source: {iso: 'CH', lat: '46.818188', lon: '8.227512'},
		// 		dest: {iso: 'CL', lat: '-35.675147', lon: '-71.542969'},
		// 		volume: 123452312321111114434346789
		// 	}
		// ];
		var pixiEvents = [];
		for (var i = 0; i < events.length; i++) {
			pixiEvents.push(eventToPixiEvent(events[i]));
		}
		console.log(pixiEvents);
		// TODO: display events on PixiJS (asaf/jim)
		return pixiEvents;
	};

	return service;
}

module.exports = PixiService;
