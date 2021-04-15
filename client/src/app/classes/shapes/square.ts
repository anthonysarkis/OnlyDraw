import { Vec2 } from '@app/classes/vec2';
import { Rectangle } from './rectangle';

export class Square extends Rectangle {
    constructor(public width: number, public height: number) {
        super(width, height);
    }

    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.findSmallestSide();
        super.drawBorder(ctx, drawingCoords);
    }

    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.findSmallestSide();
        super.drawFill(ctx, drawingCoords);
    }

    protected findSmallestSide(): void {
        const widthSign = Math.sign(this.width);
        const heightSign = Math.sign(this.height);
        this.width = Math.min(Math.abs(this.width), Math.abs(this.height));
        this.height = Math.min(Math.abs(this.width), Math.abs(this.height));
        this.width = widthSign * this.width;
        this.height = heightSign * this.height;
    }

    previewBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawBorder(ctx, drawingCoords);
    }

    previewFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawFill(ctx, drawingCoords);
    }
}
