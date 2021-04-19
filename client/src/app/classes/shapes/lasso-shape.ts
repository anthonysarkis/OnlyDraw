import { Vec2 } from '@app/classes/vec2';
import { Shape } from '@app/interfaces/shape';

export class LassoShape implements Shape {
    constructor(public pathData: Vec2[]) {}

    previewContour(): void {
        return;
    }

    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        this.drawFill(ctx, drawingCoords);
        ctx.stroke();
    }

    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {
        const pathData = this.switchPathData(drawingCoords);
        ctx.beginPath();
        ctx.moveTo(pathData[0].x, pathData[0].y);
        for (let i = 0; i < pathData.length - 1; i++) {
            const currentPoint = pathData[i + 1];
            ctx.lineTo(currentPoint.x, currentPoint.y);
        }
        ctx.closePath();
    }

    previewBorder(): void {
        return;
    }

    previewFill(): void {
        return;
    }

    switchPathData(corner: Vec2): Vec2[] {
        const basePathData: Vec2[] = [];
        for (const point of this.pathData) {
            const newPoint: Vec2 = { x: point.x + corner.x, y: point.y + corner.y };
            basePathData.push(newPoint);
        }
        return basePathData;
    }
}
