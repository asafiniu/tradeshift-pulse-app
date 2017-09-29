const easing = 0.08; // Size of each step along the path

function dist(x1, y1, x2, y2) {
	return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
}

class Connection {
	constructor({ srcPoint, dstPoint, timestamp, color }) {
		// console.log(JSON.stringify(srcPoint, null, '\t'));
		// console.log(JSON.stringify(dstPoint, null, '\t'));
		// console.log(JSON.stringify(timestamp, null, '\t'));
		this.currentPoint = { x: srcPoint.x, y: srcPoint.y };
		this.srcPoint = srcPoint;
		this.dstPoint = dstPoint;
		this.timestamp = timestamp;
		this.color = color;
		this.lineGraphics = new PIXI.Graphics();
		this.srcCircle = new PIXI.Graphics();
		this.srcCircle.x = srcPoint.x;
		this.srcCircle.y = srcPoint.y;
		this.dstCircle = new PIXI.Graphics();
		this.dstCircle.x = dstPoint.x;
		this.dstCircle.y = dstPoint.y;
		this.onStage = false;
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
		console.log('adding connection from stage');
		this.onStage = true;
		stage.addChild(this.lineGraphics);
		stage.addChild(this.srcCircle);
		stage.addChild(this.dstCircle);
	}

	removeFromStage(stage) {
		console.log('removing connection from stage');
		this.onStage = false;
		stage.removeChild(this.lineGraphics);
		stage.removeChild(this.srcCircle);
		stage.removeChild(this.dstCircle);
	}

	update() {
		this.distance = dist(this.currentPoint.x, this.currentPoint.y, this.dstPoint.x, this.dstPoint.y);
		
		if (this.distance > 1.0) {
			this.lineGraphics.clear();
			this.lineGraphics.lineStyle(3, this.color, 1); 
			this.lineGraphics.moveTo(this.currentPoint.x, this.currentPoint.y); 
			this.currentPoint.x += (this.dstPoint.x - this.currentPoint.x) * easing;
			this.currentPoint.y += (this.dstPoint.y - this.currentPoint.y) * easing;
			this.lineGraphics.lineTo(this.currentPoint.x, this.currentPoint.y);
		}
	}

	isComplete() {
		return !_.isNil(this.distance) && (this.distance <= 1.0);
	}
}

module.exports = Connection;