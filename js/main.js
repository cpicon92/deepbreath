'use strict';
//parameters
let inBreath = 4,
inHold = 2,
outBreath = 8,
outHold = 0,
humps = 2;
//generate percentages
let total = inBreath + inHold + outBreath + outHold,
inH = inHold / total,
outB = outBreath / total,
outH = outHold / total,
inB = inBreath / total;
//main app
let initPixi = function() {
    let app = new PIXI.Application(window.innerWidth, window.innerHeight, { resolution:window.devicePixelRatio, autoResize:true, antialias: true, backgroundColor: 0x6f9be2 });
    document.body.appendChild(app.view);
    app.stage.interactive = false;
    let graph = new PIXI.Graphics();
    app.stage.addChild(graph);
    let lastT = 0,
    startTick = function(startT, appW, appH) {
        let appS = (appW + appH) / 2,
        vpad = appH > 1.2 * appW ? 0.333 * appH : 0.1 * appH,
        graphW = (1 / humps) * appW,
        curveResolution = Math.round(appS / 100) * 10,
        renderBezier = function(start, cpStart, end, cpEnd) {
            let inc = 1 / curveResolution,
			points = [];
            for (let i = inc; i <= 1; i += inc) {
                points.push({i: i, x: bezierX(i, start.x, cpStart.x, cpEnd.x, end.x), y: bezierY(i, start.y, cpStart.y, cpEnd.y, end.y)});
            }
			return points;
        },
        renderCycle = function() {
			let inc = 1 / curveResolution,
			points = [];
			if (inH) for (let i = inc; i <= 1; i += inc) {
				points.push({i: inH * i, x: i * inH * graphW, y: vpad});
			}
            let outPoints = renderBezier({x: inH*graphW, y: vpad}, {x: (inH + 0.25 * outB)*graphW, y: vpad}, {x: (inH+outB)*graphW, y: appH-vpad}, {x: (inH + 0.75 * outB)*graphW, y: appH-vpad})
            for (let i = 0; i < outPoints.length; i++) {
				let p = outPoints[i];
				points.push({i: inH + outB * p.i, x: p.x, y: p.y})
			}
			if (outH) for (let i = inc; i <= 1; i += inc) {
				points.push({i: inH + outB + outH * i, x: (inH + outB + i * outH) * graphW, y: appH-vpad});
			}
            let inPoints = renderBezier({x: (inH + outB + outH)*graphW, y: appH-vpad}, {x: (inH + outB + outH + 0.25 * inB) *graphW, y: appH-vpad}, {x: graphW, y: vpad}, {x: (inH + outB + outH + 0.75 * inB) *graphW, y: vpad});
        	for (let i = 0; i < inPoints.length; i++) {
				let p = inPoints[i];
				points.push({i: inH + outB + outH + inB * p.i, x: p.x, y: p.y})
			}
			return points;
		},
		cycle = renderCycle(),
		drawCycle = function(xoff) {
			for (let i = 0; i < cycle.length; i++) {
				let p = cycle[i];
				graph.lineTo(xoff + p.x, p.y);
			}
		},
        elapsed = 0;
        return function() {
            elapsed += app.ticker.elapsedMS;
            graph.clear();
            //draw curve(s)
            graph.lineStyle(0.005 * appS, 0x000000, 1);
            graph.moveTo(0, vpad);
            let t = (startT + elapsed / (total * humps * 1000)) % 1,
            xoff = -(t % (1 / humps)) * appW + appW / 2;
            for (let i = Math.floor(-humps/2); i <= Math.ceil(humps/2); i++) {
                drawCycle(xoff + graphW * i);
            }
            lastT = t;
            //draw circle
            t = t * humps % 1;
            graph.lineStyle(0.006 * appS, 0xffffff, 1);
            let circleY = vpad;
			let circleX = appW / 2;
			for (let i = 0; i < cycle.length; i++) {
				let p = cycle[i];
				if (p.i < t) continue;
				let pp = cycle[i == 0 ? i : i - 1],
				diffP = Math.abs(t - p.i),
				diffPP = Math.abs(t - pp.i),
				diffTot = diffP + diffPP;
				circleY = (diffP/diffTot) * pp.y + (diffPP/diffTot) * p.y;
				circleX = xoff + (diffP/diffTot) * pp.x + (diffPP/diffTot) * p.x;
				if (circleY === vpad || circleY === appH - vpad) circleX = appW / 2;
				break;
			}
            let circleRadius = appS * 0.015 * (0.75 + 0.25 * (1 - (circleY / (appH - vpad * 2))));
            graph.drawCircle(circleX, circleY, circleRadius);
        };
    };
    let tick = startTick(0, window.innerWidth, window.innerHeight);
    app.ticker.add(tick);
    let onResize = function() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.ticker.remove(tick);
        tick = startTick(lastT, window.innerWidth, window.innerHeight);
        app.ticker.add(tick);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
};
window.addEventListener('load', initPixi);
//cubic bezier functions; 1 & 4 are endpoints, 2 & 3 are control points
//based on: https://stackoverflow.com/questions/37642168/how-to-convert-quadratic-bezier-curve-code-into-cubic-bezier-curve/37642695#37642695
let getPt = function(n1, n2, perc) {
    return n1 + (n2 - n1) * perc;
},
bezierX = function(i, x1, x2, x3, x4) {
    let xa = getPt( x1 , x2 , i ),
    xb = getPt( x2 , x3 , i ),
    xc = getPt( x3 , x4 , i ),
    xm = getPt( xa , xb , i ),
    xn = getPt( xb , xc , i );
    return getPt( xm , xn , i );
},
bezierY = function(i, y1, y2, y3, y4) {
    let ya = getPt(y1, y2, i),
    yb = getPt(y2, y3, i),
    yc = getPt(y3, y4, i),
    ym = getPt(ya, yb, i),
    yn = getPt(yb, yc, i);
    return getPt(ym, yn, i);
};
