// Copyright 2017 Christopher Jáquez Prado
"use strict";

class Drawer {
    constructor(canvasId, canvasSize, bgColor) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.canvasSize = canvasSize;
        this.backgroundColor = bgColor;
    }

    prepareCanvas() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    }
}