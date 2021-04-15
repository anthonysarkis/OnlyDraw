import { Vec2 } from '@app/classes/vec2';
import { ColorData } from '@app/enums/color-data';
import { Shape } from '@app/interfaces/shape';
import { MathService } from '@app/services/math/math.service';

export class Polygon implements Shape {
    private isFillOnly: boolean;
    private radius: number;
    private drawingPosition: Vec2;

    constructor(public width: number, public height: number, public numberOfSides: number, private mathService: MathService) {
        this.width = width;
        this.height = height;
        this.numberOfSides = numberOfSides;
        this.radius = 0;
        this.drawingPosition = { x: 0, y: 0 };
        this.isFillOnly = true;
    }

    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        ctx.beginPath();
        this.drawEnclosure(ctx, drawingCoords);
        ctx.stroke();
        ctx.closePath();
        this.isFillOnly = false;
    }

    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        ctx.beginPath();
        this.drawEnclosure(ctx, drawingCoords);
        ctx.fill();
        ctx.closePath();
        this.isFillOnly = true;
    }

    previewContour(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.calculateDrawingPosition(drawingCoords);
        const imageData = ctx.getImageData(this.drawingPosition.x, this.drawingPosition.y, 1, 1);
        const savedLineWidth = ctx.lineWidth;
        this.calculateRadius(savedLineWidth);
        if (imageData.data[ColorData.Alpha] === 0 && this.radius <= ctx.lineWidth) return;

        this.findSmallestSide();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'black';
        this.drawCircleBorder(ctx, drawingCoords);
        ctx.stroke();
        ctx.restore();
    }

    previewBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.isFillOnly = false;
        this.drawBorder(ctx, drawingCoords);
    }

    previewFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.isFillOnly = true;
        this.drawFill(ctx, drawingCoords);
    }

    private drawCircleBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.calculateDrawingPosition(drawingCoords);
        ctx.beginPath();
        ctx.ellipse(this.drawingPosition.x, this.drawingPosition.y, this.radius, this.radius, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
    }

    private calculateRadius(savedLineWidth: number): void {
        this.findSmallestSide();
        const lineWidthCoefficient = this.mathService.getCoefficient(this.numberOfSides);
        let addValue = 0;
        if (!this.isFillOnly) addValue = lineWidthCoefficient * savedLineWidth;
        this.radius = Math.abs(this.width) / 2 + addValue;
    }

    protected calculateDrawingPosition(drawingCoords: Vec2): void {
        this.drawingPosition.x = drawingCoords.x + this.width / 2;
        this.drawingPosition.y = drawingCoords.y + this.height / 2;
    }

    // https://stackoverflow.com/questions/4839993/how-to-draw-polygons-on-an-html5-canvas
    private drawEnclosure(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.findSmallestSide();
        const xCenter = drawingCoords.x + this.width / 2;
        const yCenter = drawingCoords.y + this.height / 2;
        ctx.moveTo(xCenter + this.width / 2, yCenter);
        for (let i = 1; i <= this.numberOfSides + 1; i += 1) {
            ctx.lineTo(
                xCenter + (this.width / 2) * Math.cos((i * 2 * Math.PI) / this.numberOfSides),
                yCenter + (this.height / 2) * Math.sin((i * 2 * Math.PI) / this.numberOfSides),
            );
        }
    }

    protected findSmallestSide(): void {
        const widthSign = Math.sign(this.width);
        const heightSign = Math.sign(this.height);
        this.width = Math.min(Math.abs(this.width), Math.abs(this.height));
        this.height = Math.min(Math.abs(this.width), Math.abs(this.height));
        this.width = widthSign * this.width;
        this.height = heightSign * this.height;
    }
}
