const easing = 0.08; // Size of each step along the path
const circleSpeed = 0.65;
const maxVolume = 25;

function dist(x1, y1, x2, y2) {
	return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
}

class Connection {
	constructor({ source, dest, timestamp, color, volume }) {
		// console.log(JSON.stringify(srcPoint, null, '\t'));
		// console.log(JSON.stringify(dstPoint, null, '\t'));
		// console.log(JSON.stringify(timestamp, null, '\t'));
		this.currentPoint = { x: source.x, y: source.y };
		this.srcPoint = source;
		this.dstPoint = dest;
		this.timestamp = timestamp;
		this.color = color;
		this.line = new PIXI.Graphics();
		this.srcCircle = new PIXI.Graphics();
		this.srcCircleTimePos = 0;
		// this.srcCircle.x = srcPoint.x;
		// this.srcCircle.y = srcPoint.y;
		this.dstCircle = new PIXI.Graphics();
		this.dstCircleTimePos = 0;
		// this.dstCircle.x = dstPoint.x;
		// this.dstCircle.y = dstPoint.y;
		this.onStage = false;
		this.volume = volume;
	}

	isOlderThan(timestamp) {
		// console.log('timestamp.valueOf()', timestamp.valueOf());
		// console.log('this.timestamp.valueOf()', this.timestamp.valueOf());
		return timestamp > this.timestamp;
	}

	isOnStage() {
		return this.onStage;
	}

	addToStage(stage) {
		// console.log('adding connection from stage');
		this.onStage = true;
		stage.addChild(this.line);
		stage.addChild(this.srcCircle);
		stage.addChild(this.dstCircle);
	}

	removeFromStage(stage) {
		// console.log('removing connection from stage');
		this.onStage = false;
		this.line.clear();
		this.srcCircle.clear();
		this.dstCircle.clear();
		stage.removeChild(this.line);
		stage.removeChild(this.srcCircle);
		stage.removeChild(this.dstCircle);
	}

	// TODO fix this hack, make circle/line objects so they can process themselves
	processLine() {
		this.line.clear();
		this.line.lineStyle(3, this.color, 1); 
		this.line.moveTo(this.currentPoint.x, this.currentPoint.y); 
		this.currentPoint.x += (this.dstPoint.x - this.currentPoint.x) * easing;
		this.currentPoint.y += (this.dstPoint.y - this.currentPoint.y) * easing;
		this.line.lineTo(this.currentPoint.x, this.currentPoint.y);
	}

	processCircle({ circle, timePos, point }) {
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
		
		this.srcCircleTimePos = this.processCircle({
			circle: this.srcCircle,
			timePos: this.srcCircleTimePos,
			point: this.srcPoint,
		});

		if (this.distance > 1.0) {
			this.processLine();
		} else {
			this.dstCircleTimePos = this.processCircle({
				circle: this.dstCircle,
				timePos: this.dstCircleTimePos,
				point: this.dstPoint,
			});
		}
	}

	isComplete() {
		return !_.isNil(this.distance) && (this.distance <= 1.0) && (this.dstCircleTimePos >= 50);
	}
}

module.exports = Connection;