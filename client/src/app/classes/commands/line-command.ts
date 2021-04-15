import { LineState } from '@app/classes/state/line-state';
import { ColorService } from '@app/services/color/color.service';
import { LineService } from '@app/services/tools/line/line.service';
import { ToolCommand } from './tool-command';

export class LineCommand extends ToolCommand {
    private savedState: LineState;

    constructor(protected tool: LineService, protected toolState: LineState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.drawFullLine();
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new LineState(
            this.tool.lineThickness,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            this.tool.pathData,
            this.tool.showJunctionPoints,
            this.tool.pointDiameter,
        );
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

    protected changeState(state: LineState): void {
        super.changeState(state);
        this.tool.showJunctionPoints = state.showJunctionPoints;
        this.tool.lineThickness = state.lineWidth;
        this.tool.pathData = state.pathData;
        this.tool.pointDiameter = state.diameterOfPoint;
    }
}
