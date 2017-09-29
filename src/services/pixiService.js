'use strict';

const _ = require('lodash');
const moment = require('moment');
const Connection = require('../models/Connection');
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 800;
const VOLUME_MIN = 3;
const VOLUME_MAX = 15;

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

	// function getRandomLocations() {
	// 	return _.reduce(locationNames, (data, locationName) => {
	// 		console.log('locationName', locationName);
	// 		return _.assign({}, data, {
	// 			[locationName]: getRandomPoint(),
	// 		});
	// 	}, {});
	// }

	function getRandomLocations() {
		return _.reduce(locationNames, (data, locationName) => {
			// console.log('locationName', locationName);
			const point = getRandomPoint();
			return _.assign({}, data, {
				[locationName]: {
					iso: '',
					lat: '',
					lon: '',
					x: point.x,
					y: point.y,
				},
			});
		}, {});
	}

	// const events = _.reduce(_.range(500), (data, value) => {
	// 	const gap = getRandomNumber(0, 1);
	// 	let nextMoment = _.isNil(data.lastMoment) ? moment() : moment(data.lastMoment);
	// 	nextMoment = nextMoment.add(gap, 'seconds');
	// 	const locationPair = getRandomLocationNamePair();
	// 	data.events.push({
	// 		timestamp: nextMoment.valueOf(),
	// 		sourceLocationName: locationPair.firstName,
	// 		targetLocationName: locationPair.secondName,
	// 	});
	// 	data.lastMoment = nextMoment;
	// 	return data;
	// }, { events: [], lastMoment: null }).events;

	const mockEvents = _.reduce(_.range(500), (data, value) => {
		const gap = getRandomNumber(0, 1);
		let nextMoment = _.isNil(data.lastMoment) ? moment() : moment(data.lastMoment);
		nextMoment = nextMoment.add(gap, 'seconds');
		const locationPair = getRandomLocationNamePair();
		const timestamp = nextMoment.valueOf();
		const source = locations[locationPair.firstName];
		const dest = locations[locationPair.secondName];
		const volume = getRandomVolume();
		data.events.push({ timestamp, source, dest, volume });
		data.lastMoment = nextMoment;
		return data;
	}, { events: [], lastMoment: null }).events;

	// console.log(JSON.stringify(events, null, '\t'));
	// addConnections(mockEvents);

	// _.each(events, ({ timestamp, source, dest, volume }) => {
	// 	// console.log('sourceLocationName', sourceLocationName, 'targetLocationName', targetLocationName);
	// 	const srcPoint = locations[sourceLocationName];
	// 	const dstPoint = locations[targetLocationName];
	// 	// console.log('srcPoint', JSON.stringify(srcPoint, null, '\t'));
	// 	// console.log('dstPoint', JSON.stringify(dstPoint, null, '\t'));
	// 	const color = getNextColor();
	// 	const volume = getRandomInt(3, 15);
	// 	const connection = new Connection({ srcPoint, dstPoint, timestamp, color, volume });
	// 	connections.push(connection);
	// });

	function addConnections(events) {
		_.each(events, ({ timestamp, source, dest, volume }) => {
			// console.log('sourceLocationName', sourceLocationName, 'targetLocationName', targetLocationName);
			// const srcPoint = locations[sourceLocationName];
			// const dstPoint = locations[targetLocationName];
			// console.log('srcPoint', JSON.stringify(srcPoint, null, '\t'));
			// console.log('dstPoint', JSON.stringify(dstPoint, null, '\t'));
			const color = getNextColor();
			const connection = new Connection({ source, dest, timestamp, color, volume });
			connections.push(connection);
		});
	}

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
		_.remove(connections, (connection) => connection.isComplete());
		renderer.render(stage);
		requestAnimationFrame(mainLoop);
	}

	function getNextColor() {
		return connectionColors[getRandomInt(0, connectionColors.length - 1)];
	}

	function getRandomNumber(min, max) {
		return min + (Math.random() * (max - min));
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getRandomPoint() {
		return {
			x: getRandomInt(0, MAP_WIDTH),
			y: getRandomInt(0, MAP_HEIGHT),
		};
	}

	function countryToPixiCountry(country) {
		// const point = getRandomPoint();
		// const point = convertGeopointToImgCoordinates1(country.lat, country.lon);
		const point = convertGeopointToImgCoordinates(country.lat, country.lon);
		// console.log('point', JSON.stringify(point, null, '\t'));
		return {
			iso: country.iso,
			lat: country.lat,
			lon: country.lon,
			x: point.x,
			y: point.y,
		};
	};

	function convertGeopointToImgCoordinates(latitude, longitude) {
		// get x value
		latitude = Number(latitude);
		longitude = Number(longitude);
		const xNumber = (longitude + 180) * (Number(MAP_WIDTH) / Number(360));

		// convert from degrees to radians
		const latRad = latitude * Math.PI / Number(180);

		// get y value
		const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
		const yNumber = (Number(MAP_HEIGHT) / 2) - (Number(MAP_WIDTH) * mercN / (2 * Math.PI));

		const SCALE = 0.82;
		const X_OFFSET = 85;
		const Y_OFFSET = 140;

		const xScaled = (xNumber * SCALE) + X_OFFSET;
		const yScaled = (yNumber * SCALE) + Y_OFFSET;

		const x = Math.round(xScaled);
		const y = Math.round(yScaled);

		return { x, y };
	}

	function awesome(volume) {
		return Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.floor(Math.log10(volume))))
	};

	function eventToPixiEvent(event, timestamp) {
		// const volume = awesome(event.volume);
		const volume = getRandomVolume();
		const source = countryToPixiCountry(event.source);
		const dest =  countryToPixiCountry(event.dest);
		return { source, dest, volume, timestamp };
	};

	function getRandomVolume() {
		return getRandomInt(3, 15);
	}

	function getRandomTimestamp({ period }) {
		const delay = getRandomNumber(0, period);
		return moment().add(delay, 'seconds').valueOf();
	}

	service.publish = function(events) {
		const pixiEvents = [];
		const period = 5;
		for (var i = 0; i < events.length; i++) {
			const timestamp = getRandomTimestamp({ period });
			pixiEvents.push(eventToPixiEvent(events[i], timestamp));
		}
		// console.log('pixiEvents', JSON.stringify(pixiEvents, null, '\t'));
		// console.log('pixiEvents.length', pixiEvents.length);
		addConnections(pixiEvents);
		// console.log('connections.length', connections.length);
		// TODO: display events on PixiJS (asaf/jim)
		return pixiEvents;
	};

	function addMockEvents() {
		const events = _.reduce(_.range(10), (data) => {
			return _.union(data, [
				// {
				// 	source: {iso: 'US', lat: '37.09024', lon: '-95.712891'},
				// 	dest: {iso: 'CA', lat: '56.130366', lon: '-106.346771'},
				// 	volume: 12305918750980980,
				// },
				{
					source: {iso: 'US', lat: '37.09024', lon: '-95.712891'},
					dest: {iso: 'CA', lat: '56.130366', lon: '-106.346771'},
					volume: 12305918750980980
				}, {
					source: {iso: 'CA', lat: '56.130366', lon: '-106.346771'},
					dest: {iso: 'US', lat: '37.09024', lon: '-95.712891'},
					volume: 233235325
				}, {
					source: {iso: 'CH', lat: '46.818188', lon: '8.227512'},
					dest: {iso: 'CL', lat: '-35.675147', lon: '-71.542969'},
					volume: 123452312321111114434346789
				}
				// {
				// 	source: {iso: 'London', lat: '51.509865', lon: '-0.118092'},
				// 	dest: {iso: 'PT', lat: '38.736946', lon: '-9.142685'},
				// 	volume: 123452312321111114434346789
				// },
				// {
				// 	source: {iso: 'Santa Cruz', lat: '36.974117', lon: '-122.030792'},
				// 	dest: {iso: 'PT', lat: '38.736946', lon: '-9.142685'},
				// 	volume: 123452312321111114434346789
				// },
				// {
				// 	source: {iso: 'Tokyo', lat: '35.652832', lon: '139.839478'},
				// 	dest: {iso: 'PT', lat: '38.736946', lon: '-9.142685'},
				// 	volume: 123452312321111114434346789
				// },
				// {
				// 	source: {iso: 'Tokyo', lat: '-21.000000', lon: '48.150002'},
				// 	dest: {iso: 'PT', lat: '38.736946', lon: '-9.142685'},
				// 	volume: 123452312321111114434346789
				// },
			]);
		}, []);
		service.publish(events);
	}

	// addMockEvents();

	setInterval(() => {
		addMockEvents();
	}, 5000);

	return service;
}

module.exports = PixiService;
