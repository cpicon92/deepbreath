'use strict';
let inBreath = 4,
inHold = 2,
outBreath = 8,
outHold = 0;
//generate percentages
let total = inBreath + inHold + outBreath + outHold,
inH = inHold / total,
outB = outBreath / total,
outH = outHold / total,
inB = inBreath / total;
let init = function() {
    let stylesheet = document.getElementById('js-css'),
    circle = document.querySelector('circle'),
    curveLeft = document.querySelector('.curve-left'),
    curveRight = document.querySelector('.curve-right');
    //generate keyframes
    let round = Math.round,
    keyframes = '@keyframes up-down {'
    + '0% {top: 0; transform: scale(1)} '
    + round(inH * 100) + '% {top: 0; transform: scale(1)} '
    + round((inH + outB) * 100) + '% {top: 90vh; transform: scale(0.7)} '
    + round((inH + outB + outH) * 100) + '% {top: 90vh; transform: scale(0.7)} '
    + '100% {top: 0; transform: scale(1)}'
    + '}';
    //apply circle animation styles
    stylesheet.innerHTML = keyframes;
    circle.style.animation = 'up-down ' + total + 's ease-in-out 0s infinite';
    //path coords
    let d = 'M0,10 H'+(inH*1000)
    +' C'+((inH + 0.5 * outB)*1000)+',10 '+((inH + 0.5 * outB)*1000)+',990 '+((inH+outB)*1000)+',990'
    +' H'+((inH + outB + outH)*1000)
    +' C'+((inH + outB + outH + 0.5 * inB) *1000)+',990 '+((inH + outB + outH + 0.5 * inB)*1000)+',10 1003,10';
    curveRight.querySelector('path').setAttribute('d', d);
    curveLeft.querySelector('path').setAttribute('d', d);
    //path animation
    curveRight.style.animation = 'shift-curve-right ' + total + 's linear 0s infinite';
    curveLeft.style.animation = 'shift-curve-left ' + total + 's linear 0s infinite';

};
let initPixi = function() {
    let appW = 800,
    appH = 600;
    let app = new PIXI.Application(appW, appH, { resolution:2, autoResize:true, antialias: true, backgroundColor: 0x6f9be2 });
    document.body.appendChild(app.view);

    app.stage.interactive = true;

    let graph = new PIXI.Graphics();
    app.stage.addChild(graph);
    let vpad = 20,
    humps = 2,
    graphW = (1 / humps) * appW;
    let oneCurve = function(xoff) {
        if (inH) graph.lineTo(xoff + inH*graphW, vpad);
        graph.quadraticCurveTo(xoff + (inH + 0.25 * outB)*graphW, vpad, xoff + (inH+outB/2)*graphW, appH/2);
        graph.quadraticCurveTo(xoff + (inH + 0.75 * outB)*graphW, appH-vpad, xoff + (inH+outB)*graphW, appH-vpad);
        if (outH) graph.lineTo(xoff + (inH + outB + outH)*graphW, appH-vpad);
        graph.quadraticCurveTo(xoff + (inH + outB + outH + 0.25 * inB) *graphW, appH-vpad, xoff + graphW - (graphW * inB / 2), appH/2);
        graph.quadraticCurveTo(xoff + (inH + outB + outH + 0.75 * inB) *graphW, vpad, xoff + graphW, vpad);
    };
    let elapsed = 0;
    app.ticker.add(function() {
        elapsed += app.ticker.elapsedMS;
        graph.clear();
        graph.lineStyle(5, 0x000000, 1);
        graph.moveTo(0, vpad);
        let t = elapsed / (total * 1000) % 1,
        xoff = -(t % (1 / humps)) * appW;
        oneCurve(xoff);
        for (let i = 1; i <= humps; i++) {
            oneCurve(xoff + graphW * i);
        };
        graph.lineStyle(7, 0xffffff, 1);
        // let circleRadius = (t * 0.5 + 0.5) * (appH / 10);
        let circleRadius = 20;
        graph.drawCircle(appW / 2, appH / 2, circleRadius);
    });
};
window.addEventListener('load', initPixi);
//from: https://github.com/arian/cubic-bezier (MIT License)
let cubicBezier = function(x1, y1, x2, y2, epsilon) {
	let curveX = function(t){
		let v = 1 - t;
		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
	},
	curveY = function(t){
		let v = 1 - t;
		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
	},
	derivativeCurveX = function(t){
		let v = 1 - t;
		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
	};
	return function(t) {
		let x = t, t0, t1, t2, x2, d2, i;
		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++){
			x2 = curveX(t2) - x;
			if (Math.abs(x2) < epsilon) return curveY(t2);
			d2 = derivativeCurveX(t2);
			if (Math.abs(d2) < 1e-6) break;
			t2 = t2 - x2 / d2;
		}
		t0 = 0, t1 = 1, t2 = x;
		if (t2 < t0) return curveY(t0);
		if (t2 > t1) return curveY(t1);
		// Fallback to the bisection method for reliability.
		while (t0 < t1){
			x2 = curveX(t2);
			if (Math.abs(x2 - x) < epsilon) return curveY(t2);
			if (x > x2) t0 = t2;
			else t1 = t2;
			t2 = (t1 - t0) * .5 + t0;
		}
		// Failure
		return curveY(t2);
	};
};
