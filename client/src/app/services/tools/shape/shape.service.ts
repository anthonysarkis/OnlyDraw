import { Injectable } from '@angular/core';
import { ShapeCommand } from '@app/classes/commands/shape-command';
import { DEFAULT_LINE_THICKNESS, MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { ShapeState } from '@app/classes/state/shape-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { Shape } from '@app/interfaces/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ShapeService extends Tool {
    isFilled: boolean;
    isBordered: boolean;
    private thicknessOfLine: number;
    isAlternateShape: boolean;
    lastMousePosition: Vec2;
    mainShape: Shape;
    alternateShape: Shape;

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.isAlternateShape = false;
        this.thicknessOfLine = DEFAULT_LINE_THICKNESS;
        this.isBordered = true;
        this.isFilled = false;
        this.mouseDownCoord = this.lastMousePosition = { x: 0, y: 0 };
    }

    initializeProperties(): void {
        this.drawingService.baseCtx.lineWidth = this.thicknessOfLine;
        this.drawingService.previewCtx.lineWidth = this.thicknessOfLine;
    }

    get lineThickness(): number {
        return this.thicknessOfLine;
    }

    set lineThickness(newThickness: number) {
        this.thicknessOfLine = Math.min(Math.max(MIN_LINE_THICKNESS, newThickness), MAX_LINE_THICKNESS);
        this.drawingService.baseCtx.lineWidth = this.thicknessOfLine;
        this.drawingService.previewCtx.lineWidth = this.thicknessOfLine;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.swapColor();
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.lastMousePosition = this.getPositionFromMouse(event);
        this.isAlternateShape ? this.drawShape(this.alternateShape) : this.drawShape(this.mainShape);
        this.addCommand();
        this.restoreContextStyle();
        this.mouseDown = false;
        this.saveCanvas();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.lastMousePosition = this.getPositionFromMouse(event);
        this.isAlternateShape ? this.previewShape(this.alternateShape) : this.previewShape(this.mainShape);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isAlternateShape = true;
            if (this.mouseDown) this.previewShape(this.alternateShape);
        }
        if (event.key === 'Escape') {
            this.mouseDown = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.restoreContextStyle();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isAlternateShape = false;
            if (this.mouseDown) this.previewShape(this.mainShape);
        }
    }

    drawShape(shape: Shape): void {
        this.calculateDimensions(shape);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isFilled) shape.drawFill(this.drawingService.baseCtx, this.mouseDownCoord);
        if (this.isBordered) shape.drawBorder(this.drawingService.baseCtx, this.mouseDownCoord);
    }

    protected calculateDimensions(shape: Shape): void {
        shape.width = this.lastMousePosition.x - this.mouseDownCoord.x;
        shape.height = this.lastMousePosition.y - this.mouseDownCoord.y;
    }

    previewShape(shape: Shape): void {
        this.calculateDimensions(shape);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isFilled) shape.previewFill(this.drawingService.previewCtx, this.mouseDownCoord);
        if (this.isBordered) shape.previewBorder(this.drawingService.previewCtx, this.mouseDownCoord);
        shape.previewContour(this.drawingService.previewCtx, this.mouseDownCoord);
    }

    swapColor(): void {
        this.swapContextStyle(this.drawingService.previewCtx);
        this.swapContextStyle(this.drawingService.baseCtx);
    }

    private swapContextStyle(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const tempStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.fillStyle = tempStrokeStyle;
    }

    restoreContextStyle(): void {
        this.drawingService.baseCtx.restore();
        this.drawingService.previewCtx.restore();
    }

    endDrawing(): void {
        super.endDrawing();
        this.restoreContextStyle();
    }

    get startingCoord(): Vec2 {
        return this.mouseDownCoord;
    }

    set startingCoord(mouseDownCoord: Vec2) {
        this.mouseDownCoord = mouseDownCoord;
    }

    addCommand(): void {
        const currentState = new ShapeState(
            this.alternateShape,
            this.mainShape,
            this.thicknessOfLine,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            this.isAlternateShape,
            this.isFilled,
            this.isBordered,
            this.mouseDownCoord,
            this.lastMousePosition,
        );
        const command = new ShapeCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
