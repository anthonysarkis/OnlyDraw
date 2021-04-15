import { Injectable } from '@angular/core';
import { DEFAULT_ERASER_THICKNESS, MAX_ERASER_THICKNESS, MIN_ERASER_THICKNESS } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TracerService } from '@app/services/tools/tracer/tracer.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends TracerService {
    get thickness(): number {
        return this.tracerThickness;
    }

    set thickness(newThickness: number) {
        this.tracerThickness = Math.min(Math.max(MIN_ERASER_THICKNESS, newThickness), MAX_ERASER_THICKNESS);
    }

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.name = ToolNames.Eraser;
        this.key = ToolKeys.Eraser;
        this.clearPath();
        this.tracerThickness = DEFAULT_ERASER_THICKNESS;
    }

    initializeProperties(): void {
        this.mainCtx = this.drawingService.baseCtx;
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.addCommand();
        this.endDrawing();
        this.saveCanvas();
        const mousePosition = this.getPositionFromMouse(event);
        this.drawSquareCursor(this.drawingService.previewCtx, mousePosition);
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        if (this.mouseDown) {
            this.pathData.push(mousePosition);
            this.fillPathData();
            this.traceLine(this.drawingService.baseCtx, this.pathData);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSquareCursor(this.drawingService.previewCtx, mousePosition);
    }

    onMouseLeave(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private getSquareCenter(pointPosition: Vec2): Vec2 {
        const xCenter = pointPosition.x - this.tracerThickness / 2;
        const yCenter = pointPosition.y - this.tracerThickness / 2;
        return { x: xCenter, y: yCenter };
    }

    private drawSquareCursor(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        const squareCenter = this.getSquareCenter(mousePosition);
        ctx.rect(squareCenter.x, squareCenter.y, this.tracerThickness, this.tracerThickness);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    private fillPathData(): void {
        if (this.pathData.length <= 1) return;
        const pointA = this.pathData[this.pathData.length - 2];
        const pointB = this.pathData[this.pathData.length - 1];

        this.pathData.pop();

        const incrementValue = 1;
        const xChange = pointA.x < pointB.x ? incrementValue : -incrementValue;
        const yChange = pointA.y < pointB.y ? incrementValue : -incrementValue;
        const changeValues = { x: xChange, y: yChange };

        const deltaX = Math.abs(pointB.x - pointA.x);
        const deltaY = Math.abs(pointB.y - pointA.y);
        const deltas = { x: deltaX, y: deltaY };

        const points: Vec2[] = [pointA, pointB];
        this.interpolatePoints(points, changeValues, deltas);
    }

    // https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
    private interpolatePoints(points: Vec2[], changeValues: Vec2, deltas: Vec2): void {
        let error = deltas.x - deltas.y;
        const pointA = { x: points[0].x, y: points[0].y };
        const pointB = points[1];
        while (pointA.x !== pointB.x || pointA.y !== pointB.y) {
            const pointToAdd = { x: pointA.x, y: pointA.y };
            this.pathData.push(pointToAdd);
            const e2 = 2 * error;
            if (e2 > -deltas.y) {
                error -= deltas.y;
                pointA.x += changeValues.x;
            }
            if (e2 < deltas.x) {
                error += deltas.x;
                pointA.y += changeValues.y;
            }
        }
    }

    traceLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        for (const point of path) {
            const squareCenter = this.getSquareCenter(point);
            ctx.fillRect(squareCenter.x, squareCenter.y, this.tracerThickness, this.tracerThickness);
        }
        ctx.closePath();
        ctx.restore();
    }
}
