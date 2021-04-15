import { ShapeState } from '@app/classes/state/shape-state';
import { ColorService } from '@app/services/color/color.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { ToolCommand } from './tool-command';

export class ShapeCommand extends ToolCommand {
    private savedState: ShapeState;

    constructor(protected tool: ShapeService, protected toolState: ShapeState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        if (this.tool.isAlternateShape) {
            this.tool.drawShape(this.toolState.alternateShape);
            this.restoreState();
            return;
        }
        this.tool.drawShape(this.toolState.mainShape);
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new ShapeState(
            this.tool.alternateShape,
            this.tool.mainShape,
            this.tool.lineThickness,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            this.tool.isAlternateShape,
            this.tool.isFilled,
            this.tool.isBordered,
            this.tool.startingCoord,
            this.tool.lastMousePosition,
        );
    }

    restoreState(): void {
        this.changeState(this.savedState);
        this.tool.restoreContextStyle();
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    assignState(): void {
        this.changeState(this.toolState);
    }

    protected changeState(state: ShapeState): void {
        super.changeState(state);
        this.tool.mainShape = state.mainShape;
        this.tool.alternateShape = state.alternateShape;
        this.tool.isAlternateShape = state.isAlternateShape;
        this.tool.lineThickness = state.lineWidth;
        this.tool.isBordered = state.isBordered;
        this.tool.isFilled = state.isFilled;
        this.tool.startingCoord = state.mouseDownCoord;
        this.tool.lastMousePosition = state.lastMousePosition;
        this.tool.swapColor();
    }
}
