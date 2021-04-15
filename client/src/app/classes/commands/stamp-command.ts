import { StampState } from '@app/classes/state/stamp-state';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { Command } from './command';

export class StampCommand implements Command {
    private savedState: StampState;

    constructor(protected tool: StampService, private toolState: StampState) {}

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.drawStamp();
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new StampState(this.tool.stampAngle, this.tool.stampScale, this.tool.currentImageNumber, this.tool.mouseDownCoord);
    }

    restoreState(): void {
        this.changeState(this.savedState);
    }

    assignState(): void {
        this.changeState(this.toolState);
    }

    protected changeState(state: StampState): void {
        this.tool.stampAngle = state.currentAngle;
        this.tool.stampScale = state.currentScale;
        this.tool.currentImageNumber = state.currentImageNumber;
        this.tool.mouseDownCoord = state.startingCoord;
    }
}
