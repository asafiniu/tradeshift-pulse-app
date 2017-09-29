const easing = 0.08; // Size of each step along the path

function dist(x1, y1, x2, y2) {
	return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
}

class Connection {
	constructor({ srcPoint, dstPoint, timestamp }) {
		// console.log(JSON.stringify(srcPoint, null, '\t'));
		// console.log(JSON.stringify(dstPoint, null, '\t'));
		// console.log(JSON.stringify(timestamp, null, '\t'));
		this.currentPoint = { x: srcPoint.x, y: srcPoint.y };
		this.srcPoint = srcPoint;
		this.dstPoint = dstPoint;
		this.timestamp = timestamp;
		this.graphics = new PIXI.Graphics()
		this.onStage = false;
	}
	
	getGraphics() {
		return this.graphics;
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
		stage.addChild(this.graphics);
	}

	removeFromStage(stage) {
		console.log('removing connection from stage');
		this.onStage = false;
		stage.removeChild(this.graphics);
	}

	getSrcPoint() {
		return this.srcPoint;
	}

	getDstPoint() {
		return this.dstPoint;
	}

	setSrcPoint(srcPoint) {
		this.srcPoint = srcPoint;
	}

	setDstPoint(dstPoint) {
		this.dstPoint = dstPoint;
	}

	update() {
		this.distance = dist(this.currentPoint.x, this.currentPoint.y, this.dstPoint.x, this.dstPoint.y);
		
		if (this.distance > 1.0) {
			this.graphics.clear();
			this.graphics.lineStyle(3, 0xFFFFFF, 1); 
			this.graphics.moveTo(this.currentPoint.x, this.currentPoint.y); 
			this.currentPoint.x += (this.dstPoint.x - this.currentPoint.x) * easing;
			this.currentPoint.y += (this.dstPoint.y - this.currentPoint.y) * easing;
			this.graphics.lineTo(this.currentPoint.x, this.currentPoint.y);
		}
	}

	isComplete() {
		return !_.isNil(this.distance) && (this.distance <= 1.0);
	}
}

module.exports = Connection;