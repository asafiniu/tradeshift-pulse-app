'use strict';

const _ = require('lodash');
const moment = require('moment');
const PIXI = require('pixi.js');

function MapService(ConnectionModel, ConstantsService, NumberUtil, KeyboardUtil) {
	const MAP_WIDTH = ConstantsService.MAP_WIDTH;
	const MAP_HEIGHT = ConstantsService.MAP_HEIGHT;
	const VOLUME_MIN = ConstantsService.VOLUME_MIN;
	const VOLUME_MAX = ConstantsService.VOLUME_MAX;
	const EVENT_SPREAD_SECONDS = 5;
	const stage = new PIXI.Container(0x000000);
	const myView = document.getElementById('map');
	const renderer = PIXI.autoDetectRenderer(MAP_WIDTH, MAP_HEIGHT, {antialiasing: true, transparent: true, resolution: 1});
	const connectionColors = [0x00B0FF, 0xFCBF12, 0x4FC610, 0xF2F2F2];
	let connections = [];
	let publishingEnabled = true;
	let disablePublishingTimeoutId;
	let xScale = Number(0.82);
	let xOffset = Number(84);
	let yScale = Number(0.89);
	let yOffset = Number(136);
	myView.appendChild(renderer.view);
	myView.parentElement.style.width = MAP_WIDTH + 'px';

	const service = {};

	// initKeyboard();
	mainLoop();

	service.publish = function(events) {
		if (!publishingEnabled) return;

		_.each(events, (event) => {
			addConnection(event);
		});
	};

	function addConnection({ source, dest, volume }) {
		const connection = new ConnectionModel({
			source: getXYCountry(source),
			dest: getXYCountry(dest),
			timestamp: getRandomTimestamp({ period: EVENT_SPREAD_SECONDS }),
			color: getNextColor(),
			volume,
			// volume: awesome(volume),
		 });
		connections.push(connection);
	}

	function getRandomTimestamp({ period }) {
		const delay = NumberUtil.getRandomNumber(0, period);
		return moment().add(delay, 'seconds').valueOf();
	}

	function getXYCountry(country) {
		const point = getGeopointFromImgCoordinates(country.lat, country.lon);
		return _.assign({}, country, {
			x: point.x,
			y: point.y,
		});
	};

	function awesome(volume) {
		return Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.floor(Math.log10(volume))))
	};

	function getGeopointFromImgCoordinates(latitude, longitude) {
		// get x value
		latitude = Number(latitude);
		longitude = Number(longitude);
		const xNumber = (longitude + 180) * (Number(MAP_WIDTH) / Number(360));

		// convert from degrees to radians
		const latRad = latitude * Math.PI / Number(180);

		// get y value
		const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
		const yNumber = (Number(MAP_HEIGHT) / 2) - (Number(MAP_WIDTH) * mercN / (2 * Math.PI));

		const xScaled = (xNumber * xScale) + xOffset;
		const yScaled = (yNumber * yScale) + yOffset;

		return { 
			x: Math.round(xScaled),
			y: Math.round(yScaled),
		};
	}

	function getNextColor() {
		return connectionColors[NumberUtil.getRandomInt(0, connectionColors.length - 1)];
	}

	function initKeyboard() {
		const a = KeyboardUtil.registerKeyCode(65);
		const z = KeyboardUtil.registerKeyCode(90);
		const s = KeyboardUtil.registerKeyCode(83);
		const x = KeyboardUtil.registerKeyCode(88);
		const d = KeyboardUtil.registerKeyCode(68);
		const c = KeyboardUtil.registerKeyCode(67);
		const f = KeyboardUtil.registerKeyCode(70);
		const v = KeyboardUtil.registerKeyCode(86);
		const b = KeyboardUtil.registerKeyCode(66);
		
		const scaleResolution = 0.01;
		const offsetResolution = 1;

		a.press = function() {
			xScale += scaleResolution;
			console.log('xScale', xScale);
		};
		z.press = function() {
			xScale -= scaleResolution;
			console.log('xScale', xScale);
		};

		s.press = function() {
			xOffset += offsetResolution;
			console.log('xOffset', xOffset);
		};
		x.press = function() {
			xOffset -= offsetResolution;
			console.log('xOffset', xOffset);
		};

		d.press = function() {
			yScale += scaleResolution;
			console.log('yScale', yScale);
		};
		c.press = function() {
			yScale -= scaleResolution;
			console.log('yScale', yScale);
		};

		f.press = function() {
			yOffset += offsetResolution;
			console.log('yOffset', yOffset);
		};
		v.press = function() {
			yOffset -= offsetResolution;
			console.log('yOffset', yOffset);
		};

		b.press = function() {
			console.log('xScale', xScale);
			console.log('xOffset', xOffset);
			console.log('yScale', yScale);
			console.log('yOffset', yOffset);
		};
	}

	function mainLoop() {
		clearTimeout(disablePublishingTimeoutId);
		if (!publishingEnabled) {
			assignNewTimestamps(connections);
			publishingEnabled = true;
		}
		const currentTimestamp = moment().valueOf();
		_.each(connections, (connection) => {
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
		disablePublishingTimeoutId = setTimeout(() => {
			publishingEnabled = false;
		}, 3000);
		requestAnimationFrame(mainLoop);
	}

	function assignNewTimestamps(connections) {
		_.each(connections, (connection) => {
			if (!connection.isOnStage()) {
				connection.setTimestamp(getRandomTimestamp({ period: EVENT_SPREAD_SECONDS }));
			}
		});
	}

	return service;
}

module.exports = [
	'ConnectionModel',
	'ConstantsService',
	'NumberUtil',
	'KeyboardUtil',
	MapService,
];
