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
        curveResolution = Math.round(appS / 100) * 10,
        drawBezier = function(start, cpStart, end, cpEnd) {
            let inc = 1 / curveResolution;
            for (let i = inc; i <= 1; i += inc) {
                graph.lineTo(bezierX(i, start.x, cpStart.x, cpEnd.x, end.x), bezierY(i, start.y, cpStart.y, cpEnd.y, end.y));
            }
        },
        drawCycle = function(xoff) {
            if (inH) graph.lineTo(xoff + inH*graphW, vpad);
            drawBezier({x: xoff + inH*graphW, y: vpad}, {x: xoff + (inH + 0.25 * outB)*graphW, y: vpad}, {x: xoff + (inH+outB)*graphW, y: appH-vpad}, {x: xoff + (inH + 0.75 * outB)*graphW, y: appH-vpad})
            if (outH) graph.lineTo(xoff + (inH + outB + outH)*graphW, appH-vpad);
            drawBezier({x: xoff + (inH + outB + outH)*graphW, y: appH-vpad}, {x: xoff + (inH + outB + outH + 0.25 * inB) *graphW, y: appH-vpad}, {x: xoff + graphW, y: vpad}, {x: xoff + (inH + outB + outH + 0.75 * inB) *graphW, y: vpad});
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
            drawCycle(xoff);
            for (let i = 1; i <= humps; i++) {
                drawCycle(xoff + graphW * i);
            }
            lastT = t;
            //draw circle
            t = t * humps % 1;
            graph.lineStyle(0.007 * appS, 0xffffff, 1);
            let circleY = vpad;
            if (t > inH && t < inH + outB) circleY = bezierY((t - inH) / outB, vpad,vpad,appH - vpad, appH - vpad);
            if (t > inH + outB && t < inH + outB + outH) circleY = 1;
            if (t > inH + outB + outH) circleY = bezierY(1 - (t - (inH + outB + outH)) / inB, vpad,vpad,appH - vpad, appH - vpad);
            let circleRadius = appS * 0.02 * (0.75 + 0.25 * (1 - (circleY / (appH - vpad * 2))));
            graph.drawCircle(appW / 2, circleY, circleRadius);
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
