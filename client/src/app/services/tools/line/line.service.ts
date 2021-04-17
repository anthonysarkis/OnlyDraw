import { Injectable } from '@angular/core';
import { LineCommand } from '@app/classes/commands/line-command';
import {
    DEFAULT_LINE_CAP,
    DEFAULT_LINE_THICKNESS,
    DEFAULT_POINT_DIAMETER,
    MAX_LINE_THICKNESS,
    MAX_POINT_DIAMETER,
    MIN_LINE_THICKNESS,
    MIN_POINT_DIAMETER,
} from '@app/classes/constants';
import { LineState } from '@app/classes/state/line-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    pathData: Vec2[];
    shiftDown: boolean = false;
    shiftedPosition: Vec2;

    private thicknessOfLine: number;
    private showPoints: boolean;
    private diameterOfPoint: number;

    constructor(drawingService: DrawingService, private mathService: MathService) {
        super(drawingService);
        this.clearPath();
        this.name = ToolNames.Line;
        this.key = ToolKeys.Line;
        this.showPoints = false;
        this.diameterOfPoint = DEFAULT_POINT_DIAMETER;
        this.thicknessOfLine = DEFAULT_LINE_THICKNESS;
    }

    initializeProperties(): void {
        this.drawingService.baseCtx.lineWidth = this.thicknessOfLine;
        this.drawingService.previewCtx.lineWidth = this.thicknessOfLine;
        this.drawingService.baseCtx.lineCap = DEFAULT_LINE_CAP;
        this.drawingService.previewCtx.lineCap = DEFAULT_LINE_CAP;
    }

    get lineThickness(): number {
        return this.thicknessOfLine;
    }

    set lineThickness(newThickness: number) {
        this.thicknessOfLine = Math.min(Math.max(MIN_LINE_THICKNESS, newThickness), MAX_LINE_THICKNESS);
        this.drawingService.baseCtx.lineWidth = this.thicknessOfLine;
        this.drawingService.previewCtx.lineWidth = this.thicknessOfLine;
    }

    get pointDiameter(): number {
        return this.diameterOfPoint;
    }

    set pointDiameter(newDiameter: number) {
        this.diameterOfPoint = Math.min(Math.max(MIN_POINT_DIAMETER, newDiameter), MAX_POINT_DIAMETER);
    }

    get showJunctionPoints(): boolean {
        return this.showPoints;
    }

    set showJunctionPoints(value: boolean) {
        if (this.pathData.length !== 0) return;
        this.showPoints = value;
    }

    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        if (event.button !== MouseButton.Left) return;
        const currentPosition = this.getPositionFromMouse(event);
        this.mouseDownCoord = this.shiftDown && this.pathData.length > 0 ? this.shiftedPosition : currentPosition;
        this.pathData.push(this.mouseDownCoord);
        this.drawAllSegments(this.drawingService.previewCtx);
        this.drawHoveringLine(this.drawingService.previewCtx, this.mouseDownCoord, currentPosition);

        this.mouseDownCoord = currentPosition;
        this.mouseDown = true;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.pathData.length === 0) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.draw();
    }

    onDoubleClick(event: MouseEvent): void {
        if (this.pathData.length <= 1) return;
        this.mouseDownCoord = this.shiftDown ? this.pathData[this.pathData.length - 2] : this.getPositionFromMouse(event);
        const finalPosition = this.mathService.verifyPointProximity(this.pathData[0], this.mouseDownCoord);

        this.pathData.pop();
        this.pathData[this.pathData.length - 1] = finalPosition;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.addCommand();
        this.drawAllSegments(this.drawingService.baseCtx);
        this.clearPath();
        this.saveCanvas();
        this.mouseDown = false;
    }

    drawFullLine(): void {
        this.drawAllSegments(this.drawingService.baseCtx);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.pathData.length < 1) return;
        switch (event.key) {
            case 'Backspace':
                this.onBackspaceEvent();
                break;
            case 'Escape':
                this.onEscapeEvent();
                break;
            case 'Shift':
                this.onShiftEvent();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.shiftKey || !this.shiftDown) return;
        this.shiftDown = false;
        if (this.pathData.length < 1) return;
        this.draw();
    }

    endDrawing(): void {
        super.endDrawing();
        this.clearPath();
        this.shiftDown = false;
        this.pathData = [];
        this.shiftedPosition = { x: 0, y: 0 };
    }

    private onShiftEvent(): void {
        if (this.shiftDown) return;
        this.shiftDown = true;
        this.draw();
    }

    private onBackspaceEvent(): void {
        if (this.pathData.length <= 1) return;
        this.pathData.pop();
        this.draw();
    }

    private onEscapeEvent(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.clearPath();
    }

    draw(): void {
        const lastPoint = this.pathData[this.pathData.length - 1];
        let currentPoint = this.mouseDownCoord;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawAllSegments(this.drawingService.previewCtx);

        if (this.shiftDown) {
            const closestAngle = this.mathService.calculateShiftedAngle(lastPoint, currentPoint);
            this.shiftedPosition = this.mathService.calculateShiftedPosition(lastPoint, currentPoint, closestAngle);
            currentPoint = this.shiftedPosition;
        }

        this.drawHoveringLine(this.drawingService.previewCtx, lastPoint, currentPoint);
    }

    private drawAllSegments(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.pathData.length - 1; i++) {
            const lastPoint = this.pathData[i];
            const currentPoint = this.pathData[i + 1];
            if (this.showJunctionPoints) this.drawPoint(ctx, lastPoint);
            this.drawHoveringLine(ctx, lastPoint, currentPoint);
        }
        if (this.showJunctionPoints) this.drawPoint(ctx, this.pathData[this.pathData.length - 1]);
    }

    private drawHoveringLine(ctx: CanvasRenderingContext2D, lastPosition: Vec2, mousePosition: Vec2): void {
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.stroke();
    }

    private drawPoint(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.beginPath();
        const radius = this.diameterOfPoint / 2;
        ctx.arc(mousePosition.x, mousePosition.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    addCommand(): void {
        const currentState = new LineState(
            this.lineThickness,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            this.pathData,
            this.showJunctionPoints,
            this.pointDiameter,
        );
        const command = new LineCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
