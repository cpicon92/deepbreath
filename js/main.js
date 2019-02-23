'use strict';
let inBreath = 4,
inHold = 2,
outBreath = 8,
outHold = 0,
init = function() {
    let stylesheet = document.getElementById('js-css'),
    circle = document.querySelector('circle'),
    curveLeft = document.querySelector('.curve-left'),
    curveRight = document.querySelector('.curve-right');
    //generate percentages
    let total = inBreath + inHold + outBreath + outHold,
    inH = inHold / total,
    outB = outBreath / total,
    outH = outHold / total,
    inB = inBreath / total,
    round = Math.round;
    //generate keyframes
    let keyframes = '@keyframes up-down {'
    + '0% {top: 0; transform: scale(1)} '
    + round(inH * 100) + '% {top: 0; transform: scale(1)} '
    + round((inH + outB) * 100) + '% {top: calc(100vh - 10vw); transform: scale(0.7)} '
    + round((inH + outB + outH) * 100) + '% {top: calc(100vh - 10vw); transform: scale(0.7)} '
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
window.addEventListener('load', init);
