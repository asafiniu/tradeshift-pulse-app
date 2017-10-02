'use strict';

const Victor = require('Victor');
const PIXI = require('pixi.js');

function ConnectionModel(EasingUtil) {
	const easingSpeed = 0.08; // Size of each step along the path
	const maxVolume = 25;
	const lineLength = 40;

	class Connection {
		constructor({ source, dest, timestamp, color, volume }) {
			this.currentPoint = { x: source.x, y: source.y };
			this.srcPoint = source;
			this.dstPoint = dest;
			this.timestamp = timestamp;
			this.color = color;
			this.onStage = false;
			this.volume = volume;
			this.length = dist(source.x, source.y, dest.x, dest.y);

			this.line = new PIXI.Graphics();
			this.srcCircle = new PIXI.Graphics();
			this.srcCircleTimePos = 0;
			this.dstCircle = new PIXI.Graphics();
			this.dstCircleTimePos = 0;
			
			const textStyle = new PIXI.TextStyle({
				fill: '#ffffff',
				fontSize: 15,
			});
			const textOffsetX = -15;
			const textOffsetY = -40;
			this.srcText = new PIXI.Text(`${source.name} (${source.iso})`, textStyle);
			this.srcText.x = source.x + textOffsetX;
			this.srcText.y = source.y + textOffsetY;
			this.dstText = new PIXI.Text(`${dest.name} (${dest.iso})`, textStyle);
			this.dstText.x = dest.x + textOffsetX;
			this.dstText.y = dest.y + textOffsetY;

			this.step = 0;
			this.period = Number(120);
			this.movementVector = new Victor(
				Number(this.dstPoint.x - this.srcPoint.x) / this.period,
				Number(this.dstPoint.y - this.srcPoint.y) / this.period
			);
			this.lineLengthInSteps = (Number(1) / Number(this.movementVector.length())) * Number(lineLength); 
			this.normal = this.movementVector.clone().normalize();
		}
	
		setTimestamp(timestamp) {
			this.timestamp = timestamp;
		}

		isOlderThan(timestamp) {
			return timestamp > this.timestamp;
		}
	
		isOnStage() {
			return this.onStage;
		}
	
		addToStage(stage) {
			this.onStage = true;
			stage.addChild(this.line);
			stage.addChild(this.srcCircle);
			stage.addChild(this.dstCircle);
			// stage.addChild(this.srcText);
			// stage.addChild(this.dstText);
		}
	
		removeFromStage(stage) {
			this.onStage = false;
			this.line.clear();
			this.srcCircle.clear();
			this.dstCircle.clear();
			stage.removeChild(this.line);
			stage.removeChild(this.srcCircle);
			stage.removeChild(this.dstCircle);
			// stage.removeChild(this.srcText);
			// stage.removeChild(this.dstText);
		}
	
		processLine() {
			this.line.clear();
			this.line.lineStyle(3, this.color, 1); 
			this.line.moveTo(this.currentPoint.x, this.currentPoint.y);
			this.currentPoint.x += (this.dstPoint.x - this.currentPoint.x) * easingSpeed;
			this.currentPoint.y += (this.dstPoint.y - this.currentPoint.y) * easingSpeed;
			this.line.lineTo(this.currentPoint.x, this.currentPoint.y);
		}
	
		// processLine() {
		// 	this.line.clear();
		// 	this.line.moveTo(this.currentPoint.x, this.currentPoint.y);
			
		// 	//lineLength needs to be in stepUnits for calculation
		// 	let lineCrop = (this.step < this.lineLengthInSteps ? this.movementVector.length() : lineLength);
		// 	lineCrop = (this.step > (this.period - this.lineLengthInSteps) ? (this.length - this.movementVector.length()) : lineCrop);
		// 	const targetPoint = {
		// 		x: this.currentPoint.x + (this.normal.x * lineCrop),
		// 		y: this.currentPoint.y + (this.normal.y * lineCrop),
		// 	};
		// 	this.line.lineStyle(3, this.color, 1); 
		// 	this.line.lineTo(targetPoint.x, targetPoint.y);
		// 	const EasingUtilValue = EasingUtil.linear(Number(this.step) / Number(this.period));
		// 	this.currentPoint.x = this.srcPoint.x + ((this.dstPoint.x - this.srcPoint.x) * EasingUtilValue);
		// 	this.currentPoint.y = this.srcPoint.y + ((this.dstPoint.y - this.srcPoint.y) * EasingUtilValue);		
		// }
	
		processCircle({ circle, timePos, point, circleSpeed }) {
			let newTimePos = timePos;
			newTimePos += circleSpeed;
			let circleSize;
			if (newTimePos < maxVolume) {
				circleSize = newTimePos;
			} else {
				circleSize = maxVolume - (newTimePos - maxVolume);
			}
			circleSize = (circleSize / maxVolume) * this.volume;
			circle.clear();
			circle.lineStyle(0);
			circle.beginFill(this.color, 1);
			circle.drawCircle(point.x, point.y, circleSize);
			circle.endFill();
			return newTimePos;
		}
	
		update() {
			this.distance = dist(this.currentPoint.x, this.currentPoint.y, this.dstPoint.x, this.dstPoint.y);
			// this.step++;

			this.srcCircleTimePos = this.processCircle({
				circle: this.srcCircle,
				timePos: this.srcCircleTimePos,
				point: this.srcPoint,
				circleSpeed: 0.25,
			});
			this.dstCircleTimePos = this.processCircle({
				circle: this.dstCircle,
				timePos: this.dstCircleTimePos,
				point: this.dstPoint,
				circleSpeed: 0.25,
			});
			if (this.distance > 1.0) {
			// if (this.step < this.period) {
				this.processLine();
			}
		}
	
		isComplete() {
			return !_.isNil(this.distance) && (this.distance <= 1.0) && (this.dstCircleTimePos >= 50);
			// return (this.step >= this.period);// && (this.dstCircleTimePos >= 50);
		}
	}

	function dist(x1, y1, x2, y2) {
		return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
	}
	
	function getSign(number) {
		if (number > 0) {
			return 1;
		} else {
			return -1;
		}
	}

	return Connection
}

module.exports = ConnectionModel;
