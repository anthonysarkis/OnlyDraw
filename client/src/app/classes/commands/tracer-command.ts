import { TracerState } from '@app/classes/state/tracer-state';
import { ColorService } from '@app/services/color/color.service';
import { TracerService } from '@app/services/tools/tracer/tracer.service';
import { ToolCommand } from './tool-command';

export class TracerCommand extends ToolCommand {
    private savedState: TracerState;

    constructor(protected tool: TracerService, protected toolState: TracerState, protected colorService: ColorService) {
        super(tool, toolState, colorService);
    }

    execute(): void {
        this.saveState();
        this.assignState();
        this.tool.draw();
        this.tool.endDrawing();
        this.restoreState();
    }

    saveState(): void {
        this.savedState = new TracerState(
            this.tool.thickness,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            this.tool.getpathData,
        );
    }

    restoreState(): void {
        this.changeState(this.savedState);
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }

    assignState(): void {
        this.changeState(this.toolState);
    }

    protected changeState(state: TracerState): void {
        super.changeState(state);
        this.tool.thickness = state.lineWidth;
        this.tool.setpathData = state.pathData;
    }
}
