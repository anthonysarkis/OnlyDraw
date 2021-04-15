import { ToolState } from '@app/classes/state/tool-state';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { Command } from './command';

export abstract class ToolCommand implements Command {
    constructor(protected tool: Tool, protected toolState: ToolState, protected colorService: ColorService) {}
    abstract execute(): void;
    abstract saveState(): void;
    abstract restoreState(): void;
    abstract assignState(): void;
    abstract saveCanvas(): void;

    protected changeState(state: ToolState): void {
        this.colorService.primaryColor = state.primaryColor;
        this.colorService.secondaryColor = state.secondaryColor;
        this.colorService.colorChanged.next(true);
    }
}
