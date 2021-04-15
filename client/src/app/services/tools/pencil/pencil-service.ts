import { Injectable } from '@angular/core';
import { DEFAULT_LINE_THICKNESS } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TracerService } from '@app/services/tools/tracer/tracer.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends TracerService {
    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.name = ToolNames.Pencil;
        this.key = ToolKeys.Pencil;
        this.clearPath();
        this.tracerThickness = DEFAULT_LINE_THICKNESS;
    }

    initializeProperties(): void {
        this.drawingService.baseCtx.lineWidth = this.tracerThickness;
        this.drawingService.previewCtx.lineWidth = this.tracerThickness;
        this.mainCtx = this.drawingService.previewCtx;
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.traceLine(this.drawingService.baseCtx, this.pathData);
        this.addCommand();
        this.mouseDown = false;
        this.clearPath();
        this.saveCanvas();
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        if (!this.mouseDown) return;
        this.pathData.push(mousePosition);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.traceLine(this.drawingService.previewCtx, this.pathData);
    }

    traceLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = false;
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
}
