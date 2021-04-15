import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    name: string;
    icon: string;
    key: string;
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    constructor(protected drawingService: DrawingService) {}

    initializeProperties(): void {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseLeave(event: MouseEvent): void {}

    onMouseWheel(event: MouseEvent): void {}

    onDoubleClick(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    saveCanvas(): void {
        this.drawingService.saveCanvas();
    }

    endDrawing(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDown = false;
    }

    getPositionFromMouse(event: MouseEvent): Vec2 {
        if (this.drawingService.canvas != undefined) {
            return {
                x: event.clientX - this.drawingService.canvas.getBoundingClientRect().left,
                y: event.clientY - this.drawingService.canvas.getBoundingClientRect().top,
            };
        }
        return { x: event.offsetX, y: event.offsetY };
    }
}
