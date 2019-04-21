'use strict';
//parameters
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
//main app
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
        //draw curve(s)
        graph.lineStyle(5, 0x000000, 1);
        graph.moveTo(0, vpad);
        let t = elapsed / (total * 1000) % 1,
        xoff = -(t % (1 / humps)) * appW;
        oneCurve(xoff);
        for (let i = 1; i <= humps; i++) {
            oneCurve(xoff + graphW * i);
        };
        //draw circle
        t = t * humps % 1;
        graph.lineStyle(7, 0xffffff, 1);
        let circleY = 0;
        if (t > inH && t < inH + outB) circleY = bezierY((t - inH) / outB, 0,0,1,1);
        if (t > inH + outB && t < inH + outB + outH) circleY = 1;
        if (t > inH + outB + outH) circleY = bezierY(1 - (t - (inH + outB + outH)) / inB, 0,0,1,1);
        let circleRadius = appH * 0.03 * (0.75 + 0.25 * (1 - circleY));
        graph.drawCircle(appW / 2, vpad + circleY * (appH - vpad * 2), circleRadius);
    });
};
window.addEventListener('load', initPixi);
//find y for point i from 0-1 on a bezier curve
//based on: https://stackoverflow.com/questions/37642168/how-to-convert-quadratic-bezier-curve-code-into-cubic-bezier-curve/37642695#37642695
let bezierY = function(i, y1, y2, y3, y4) {
    let getPt = function(n1, n2, perc) {
        return n1 + (n2 - n1) * perc;
    },
    ya = getPt(y1, y2, i),
    yb = getPt(y2, y3, i),
    yc = getPt(y3, y4, i),
    ym = getPt(ya, yb, i),
    yn = getPt(yb, yc, i);
    return getPt(ym, yn, i);
};
