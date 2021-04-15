import { Vec2 } from '@app/classes/vec2';
import { Shape } from '@app/interfaces/shape';
import { Rectangle } from './rectangle';

export class Ellipse implements Shape {
    radius: Vec2;
    drawingPosition: Vec2;

    constructor(public width: number, public height: number) {
        this.width = width;
        this.height = height;
        this.radius = { x: 0, y: 0 };
        this.drawingPosition = { x: 0, y: 0 };
    }

    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.calculateRadius(ctx, false);
        this.calculateDrawingPosition(ctx, drawingCoords);
        if (this.radius.x > 0 && this.radius.y > 0) {
            ctx.beginPath();
            ctx.ellipse(this.drawingPosition.x, this.drawingPosition.y, this.radius.x, this.radius.y, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            return;
        }
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle;
        this.drawFill(ctx, drawingCoords);
        ctx.restore();
    }

    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.calculateRadius(ctx, true);
        this.calculateDrawingPosition(ctx, drawingCoords);
        ctx.beginPath();
        ctx.ellipse(this.drawingPosition.x, this.drawingPosition.y, this.radius.x, this.radius.y, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    previewBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawBorder(ctx, drawingCoords);
    }

    previewFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawFill(ctx, drawingCoords);
    }

    protected calculateRadius(ctx: CanvasRenderingContext2D, isFilled: boolean): void {
        const currentLineWidth = ctx.lineWidth;
        if (isFilled) {
            this.radius.x = Math.abs(this.width / 2);
            this.radius.y = Math.abs(this.height / 2);
            return;
        }
        if (Math.abs(this.width) <= 2 * currentLineWidth || Math.abs(this.height) <= 2 * currentLineWidth) {
            this.radius.x = 0;
            this.radius.y = 0;
            return;
        }
        this.radius.x = Math.abs(this.width / 2) - currentLineWidth / 2;
        this.radius.y = Math.abs(this.height / 2) - currentLineWidth / 2;
    }

    protected calculateDrawingPosition(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawingPosition.x = drawingCoords.x + this.width / 2;
        this.drawingPosition.y = drawingCoords.y + this.height / 2;
    }

    previewContour(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        const currentLineWidth = ctx.lineWidth;
        ctx.lineWidth = 1;
        ctx.save();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'black';
        const rectangle = new Rectangle(this.width, this.height);
        rectangle.drawBorder(ctx, drawingCoords);
        ctx.restore();
        ctx.lineWidth = currentLineWidth;
    }
}
