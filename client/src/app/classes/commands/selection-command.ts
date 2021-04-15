import { SelectionState } from '@app/classes/state/selection-state';
import { ColorService } from '@app/services/color/color.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolCommand } from './tool-command';

export class SelectionCommand extends ToolCommand {
    private savedState: SelectionState;

    constructor(protected tool: SelectionService, protected toolState: SelectionState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        if (!this.tool.isPasted) this.tool.fillShapeWhite();
        this.tool.imageService.drawOnBaseCtx(this.tool.selectedImage, this.tool.currentCorner, this.tool.currentDimensions);
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new SelectionState(
            1,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            this.tool.currentDimensions,
            this.tool.currentCorner,
            this.tool.selectedImage,
            this.tool.shape,
            { width: this.tool.shape.width as number, height: this.tool.shape.height as number },
            this.tool.initialShapeCoord,
            { width: this.tool.initialShapeDimensions.width, height: this.tool.initialShapeDimensions.height },
            this.tool.isPasted,
            [this.tool.xTransformation, this.tool.yTransformation],
        );
    }

    restoreState(): void {
        this.tool.isSelected = false;
        this.changeState(this.savedState);
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    assignState(): void {
        this.tool.isSelected = true;
        this.changeState(this.toolState);
    }

    protected changeState(state: SelectionState): void {
        super.changeState(state);
        this.tool.currentCorner = state.currentCorner;
        this.tool.currentDimensions = state.currentDimensions;
        this.tool.selectedImage = state.selectedImage;
        this.tool.shape = state.shape;
        this.tool.shape.width = state.shapeDimensions.width;
        this.tool.shape.height = state.shapeDimensions.height;
        this.tool.initialShapeCoord = state.initialShapeCoord;
        this.tool.initialShapeDimensions = { width: state.currentDimensions.width, height: state.currentDimensions.height };
        this.tool.isPasted = state.isPasted;
        this.tool.xTransformation = state.transformations[0];
        this.tool.yTransformation = state.transformations[1];
    }
}
