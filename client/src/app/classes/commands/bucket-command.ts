import { BucketState } from '@app/classes/state/bucket-state';
import { ColorService } from '@app/services/color/color.service';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { ToolCommand } from './tool-command';

export class BucketCommand extends ToolCommand {
    private savedState: BucketState;

    constructor(protected tool: BucketService, protected toolState: BucketState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.draw();
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new BucketState(1, this.colorService.primaryColor, this.colorService.secondaryColor, this.tool.imageDataToPut);
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

    changeState(state: BucketState): void {
        super.changeState(state);
        this.tool.imageDataToPut = state.imageData;
    }
}
