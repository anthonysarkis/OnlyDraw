import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { AerosolCommand } from '@app/classes/commands/aerosol-command';
import {
    DEFAULT_AEROSOL_DIAMETER,
    DEFAULT_POINTS_PER_EMISSION,
    DIAMETER_POINT_SIZE_RATIO,
    MAX_AEROSOL_DIAMETER,
    MAX_AEROSOL_EMISSIONS,
    MILLISECONDS_IN_SECOND,
    MIN_AEROSOL_DIAMETER,
    MIN_AEROSOL_EMISSIONS,
    MIN_AEROSOL_POINT_SIZE
} from '@app/classes/constants';
import { AerosolState } from '@app/classes/state/aerosol-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class AerosolService extends Tool {
    pathData: Set<Vec2>;
    fullPathData: Vec2[];
    private aerosolDiameter: number;
    private aerosolPointSize: number;
    private aerosolEmissions: number;
    private interval: number;
    private mousePosition: Vec2;
    private offscreenCanvas: HTMLCanvasElement;
    private offscreenContext: CanvasRenderingContext2D;

    get emissions(): number {
        return this.aerosolEmissions;
    }

    set emissions(newAerosolEmissions: number) {
        this.aerosolEmissions = Math.min(Math.max(MIN_AEROSOL_EMISSIONS, newAerosolEmissions), MAX_AEROSOL_EMISSIONS);
    }

    get pointSize(): number {
        return this.aerosolPointSize;
    }

    set pointSize(newPointSize: number) {
        const tenthDiameter = Math.ceil(this.aerosolDiameter / DIAMETER_POINT_SIZE_RATIO);
        this.aerosolPointSize = Math.min(Math.max(MIN_AEROSOL_POINT_SIZE, newPointSize), tenthDiameter);
    }

    get diameter(): number {
        return this.aerosolDiameter;
    }

    set diameter(newDiameter: number) {
        this.aerosolDiameter = Math.min(Math.max(MIN_AEROSOL_DIAMETER, newDiameter), MAX_AEROSOL_DIAMETER);
    }

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.name = ToolNames.Aerosol;
        this.key = ToolKeys.Aerosol;
        this.clearPath();
        this.aerosolDiameter = DEFAULT_AEROSOL_DIAMETER;
        this.aerosolPointSize = MIN_AEROSOL_POINT_SIZE;
        this.aerosolEmissions = MIN_AEROSOL_EMISSIONS;
        this.fullPathData = [];
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left && this.isPointInCanvas(this.getPositionFromMouse(event));
        if (!this.mouseDown) return;
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.mousePosition = this.mouseDownCoord;
        this.startSpray();
    }

    onMouseUp(): void {
        if (!this.mouseDown) return;
        this.addCommand();
        this.endSpray();
        this.saveCanvas();
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
    }

    private startSpray(): void {
        this.setOffscreenCanvas();
        const timeBetweenEmissions = (1 / this.emissions) * MILLISECONDS_IN_SECOND;
        // inspiré de https://codepen.io/kangax/pen/itmrd
        this.interval = window.setInterval(() => {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.addEmissionPoints();
            this.draw(this.drawingService.previewCtx);
            this.addToFullPath();
            this.clearPath();
        }, timeBetweenEmissions);
    }

    private setOffscreenCanvas(): void {
        this.offscreenCanvas = this.drawingService.canvas.cloneNode(true) as HTMLCanvasElement;
        this.offscreenContext = this.offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
    }

    private addToFullPath(): void {
        for (const point of this.pathData) {
            this.fullPathData.push(point);
        }
    }

    endDrawing(): void {
        this.clearAll();
        this.endSpray();
        super.endDrawing();
    }

    private endSpray(): void {
        if (!this.mouseDown) return;
        this.drawingService.baseCtx.drawImage(this.drawingService.previewCtx.canvas, 0, 0);
        this.clearAll();
        clearInterval(this.interval);
        this.saveCanvas();
    }

    private clearAll(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.clearOffscreenContext();
        this.clearFullPath();
        this.clearPath();
    }

    private addEmissionPoints(): void {
        for (let i = 0; i < DEFAULT_POINTS_PER_EMISSION; i++) {
            const angle = this.getRandomNumber(0, Math.PI * 2);
            const radius = this.getRandomNumber(0, this.aerosolDiameter / 2);
            const newPoint: Vec2 = {
                x: Math.floor(this.mousePosition.x + radius * Math.cos(angle)),
                y: Math.floor(this.mousePosition.y + radius * Math.sin(angle)),
            };
            if (this.isPointInCanvas(newPoint)) {
                this.pathData.add(newPoint);
            }
        }
    }

    draw(visibleContext: CanvasRenderingContext2D = this.drawingService.baseCtx): void {
        const realColor = this.drawingService.colorService.primaryColor;
        const opaqueColor = new Color(realColor.red, realColor.green, realColor.blue, 1);
        this.drawOffscreenContext(this.offscreenContext, opaqueColor);
        this.drawVisibleContext(visibleContext, realColor);
    }

    private drawOffscreenContext(ctx: CanvasRenderingContext2D, opaqueColor: Color): void {
        ctx.fillStyle = opaqueColor.getRgb();
        for (const point of this.pathData) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.aerosolPointSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }

    private drawVisibleContext(visibleContext: CanvasRenderingContext2D, realColor: Color): void {
        visibleContext.save();
        visibleContext.globalAlpha = realColor.alpha;
        visibleContext.drawImage(this.offscreenCanvas, 0, 0);
        visibleContext.restore();
    }

    private isPointInCanvas(point: Vec2): boolean {
        const canvasWidth = this.drawingService.canvas.width;
        const canvasHeight = this.drawingService.canvas.height;
        const isPointPositive = point.x > 0 && point.y > 0;
        const isPointSmallerThanCanvas = point.x < canvasWidth && point.y < canvasHeight;
        return isPointPositive && isPointSmallerThanCanvas;
    }

    private getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    clearOffscreenContext(): void {
        if (this.offscreenContext) this.offscreenContext.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
    }

    clearPath(): void {
        this.pathData = new Set<Vec2>();
    }

    clearFullPath(): void {
        this.fullPathData = [];
    }

    addCommand(): void {
        const currentState = new AerosolState(
            1,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            this.pathData,
            this.fullPathData,
            this.aerosolPointSize,
        );
        const command = new AerosolCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
