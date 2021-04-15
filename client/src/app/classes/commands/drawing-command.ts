import { DrawingState } from '@app/classes/state/drawing-state';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class DrawingCommand implements Command {
    private savedState: DrawingState;

    constructor(protected tool: DrawingService, protected toolState: DrawingState, protected colorService: ColorService) {}

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.drawCanvas(this.tool.canvasImage);
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new DrawingState(1, this.colorService.primaryColor, this.colorService.secondaryColor, this.tool.canvasImage);
    }

    restoreState(): void {
        this.changeState(this.savedState);
    }

    assignState(): void {
        this.changeState(this.toolState);
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    private changeState(state: DrawingState): void {
        this.colorService.primaryColor = state.primaryColor;
        this.colorService.secondaryColor = state.secondaryColor;
        this.colorService.colorChanged.next(true);
        this.tool.canvasImage = state.selectedImage;
    }
}
