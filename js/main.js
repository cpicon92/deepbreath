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
    let app = new PIXI.Application(window.innerWidth, window.innerHeight, { resolution:2, autoResize:true, antialias: true, backgroundColor: 0x6f9be2 });
    document.body.appendChild(app.view);
    app.stage.interactive = true;
    let graph = new PIXI.Graphics();
    app.stage.addChild(graph);
    let lastT = 0,
    startTick = function(startT, appW, appH) {
        let appS = (appW + appH) / 2,
        vpad = appH > 1.2 * appW ? 0.333 * appH : 0.1 * appH,
        graphW = (1 / humps) * appW,
        oneCurve = function(xoff) {
            if (inH) graph.lineTo(xoff + inH*graphW, vpad);
            graph.quadraticCurveTo(xoff + (inH + 0.25 * outB)*graphW, vpad, xoff + (inH+outB/2)*graphW, appH/2);
            graph.quadraticCurveTo(xoff + (inH + 0.75 * outB)*graphW, appH-vpad, xoff + (inH+outB)*graphW, appH-vpad);
            if (outH) graph.lineTo(xoff + (inH + outB + outH)*graphW, appH-vpad);
            graph.quadraticCurveTo(xoff + (inH + outB + outH + 0.25 * inB) *graphW, appH-vpad, xoff + graphW - (graphW * inB / 2), appH/2);
            graph.quadraticCurveTo(xoff + (inH + outB + outH + 0.75 * inB) *graphW, vpad, xoff + graphW, vpad);
        },
        bezierY = function(i, y1, y2, y3, y4) {
            //find y for point i from 0-1 on a bezier curve
            //based on: https://stackoverflow.com/questions/37642168/how-to-convert-quadratic-bezier-curve-code-into-cubic-bezier-curve/37642695#37642695
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
        let elapsed = 0;
        return function() {
            elapsed += app.ticker.elapsedMS;
            graph.clear();
            //draw curve(s)
            graph.lineStyle(0.005 * appS, 0x000000, 1);
            graph.moveTo(0, vpad);
            let t = (startT + elapsed / (total * humps * 1000)) % 1,
            xoff = -(t % (1 / humps)) * appW;
            oneCurve(xoff);
            for (let i = 1; i <= humps; i++) {
                oneCurve(xoff + graphW * i);
            }
            lastT = t;
            //draw circle
            t = t * humps % 1;
            graph.lineStyle(0.007 * appS, 0xffffff, 1);
            let circleY = 0;
            if (t > inH && t < inH + outB) circleY = bezierY((t - inH) / outB, 0,0,1,1);
            if (t > inH + outB && t < inH + outB + outH) circleY = 1;
            if (t > inH + outB + outH) circleY = bezierY(1 - (t - (inH + outB + outH)) / inB, 0,0,1,1);
            let circleRadius = appS * 0.02 * (0.75 + 0.25 * (1 - circleY));
            graph.drawCircle(appW / 2, vpad + circleY * (appH - vpad * 2), circleRadius);
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
    //fullscreen on click
    // document.documentElement.style.cursor = 'pointer';
    // document.documentElement.title = 'Click for fullscreen...';
    // let onClick = function(e) {
    //     if (e.button) return;
    //     if (document.fullscreenElement) {
    //         document.exitFullscreen() ;
    //     } else {
    //         document.documentElement.requestFullscreen() ;
    //     }
    // };
    // document.addEventListener("click", onClick);
    // document.addEventListener("touchend", onClick);
};
window.addEventListener('load', initPixi);
