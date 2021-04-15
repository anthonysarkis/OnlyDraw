import { AerosolState } from '@app/classes/state/aerosol-state';
import { ColorService } from '@app/services/color/color.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { ToolCommand } from './tool-command';

export class AerosolCommand extends ToolCommand {
    private savedState: AerosolState;

    constructor(protected tool: AerosolService, protected toolState: AerosolState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.draw();
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new AerosolState(
            1,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            this.tool.pathData,
            this.tool.fullPathData,
            this.tool.pointSize,
        );
    }

    restoreState(): void {
        this.changeState(this.savedState);
        this.tool.pathData = this.savedState.pathData;
        this.tool.fullPathData = this.savedState.fullPathData;
    }

    assignState(): void {
        this.changeState(this.toolState);
        this.tool.pathData = new Set();

        for (const point of this.toolState.fullPathData) {
            this.tool.pathData.add(point);
        }
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    protected changeState(state: AerosolState): void {
        super.changeState(state);
        this.tool.pointSize = state.pointSize;
        this.tool.clearOffscreenContext();
    }
}
