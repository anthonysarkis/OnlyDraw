import { Vec2 } from '@app/classes/vec2';

export interface Shape {
    width?: number;
    height?: number;
    numberOfSides?: number;
    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void;
    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void;
    previewBorder(ctx?: CanvasRenderingContext2D, drawingCoords?: Vec2): void;
    previewFill(ctx?: CanvasRenderingContext2D, drawingCoords?: Vec2): void;
    previewContour(ctx?: CanvasRenderingContext2D, drawingCoords?: Vec2): void;
}
