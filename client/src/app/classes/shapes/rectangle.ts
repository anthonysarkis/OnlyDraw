import { Vec2 } from '@app/classes/vec2';
import { Shape } from '@app/interfaces/shape';

export class Rectangle implements Shape {
    constructor(public width: number, public height: number) {
        this.width = width;
        this.height = height;
    }

    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        ctx.beginPath();
        ctx.strokeRect(drawingCoords.x, drawingCoords.y, this.width, this.height);
        ctx.closePath();
    }

    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        ctx.beginPath();
        ctx.rect(drawingCoords.x, drawingCoords.y, this.width, this.height);
        ctx.fill();
        ctx.closePath();
    }

    previewBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawBorder(ctx, drawingCoords);
    }

    previewFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawFill(ctx, drawingCoords);
    }

    previewContour(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        return;
    }
}
