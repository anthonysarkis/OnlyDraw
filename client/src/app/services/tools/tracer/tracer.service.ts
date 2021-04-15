import { Injectable } from '@angular/core';
import { TracerCommand } from '@app/classes/commands/tracer-command';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { TracerState } from '@app/classes/state/tracer-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export abstract class TracerService extends Tool {
    protected pathData: Vec2[];
    protected mainCtx: CanvasRenderingContext2D;
    protected tracerThickness: number;

    get thickness(): number {
        return this.tracerThickness;
    }

    set thickness(newThickness: number) {
        this.tracerThickness = Math.min(Math.max(MIN_LINE_THICKNESS, newThickness), MAX_LINE_THICKNESS);
        this.drawingService.baseCtx.lineWidth = this.tracerThickness;
        this.drawingService.previewCtx.lineWidth = this.tracerThickness;
    }

    get getpathData(): Vec2[] {
        return this.pathData;
    }

    set setpathData(pathData: Vec2[]) {
        this.pathData = pathData;
    }

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pathData.push(this.mouseDownCoord);
        this.traceLine(this.mainCtx, this.pathData);
    }

    // Ceci est justifié vu que c'est une methode qui sera gérée par les classes enfant
    // tslint:disable-next-line: no-empty
    protected traceLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {}

    draw(): void {
        this.traceLine(this.drawingService.baseCtx, this.pathData);
    }

    clearPath(): void {
        this.pathData = [];
    }

    endDrawing(): void {
        super.endDrawing();
        this.clearPath();
    }

    addCommand(): void {
        const currentState = new TracerState(
            this.tracerThickness,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            this.pathData,
        );
        const command = new TracerCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
