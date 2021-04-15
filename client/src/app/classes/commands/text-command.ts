import { TextState } from '@app/classes/state/text-state';
import { ColorService } from '@app/services/color/color.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolCommand } from './tool-command';

export class TextCommand extends ToolCommand {
    private savedState: TextState;
    constructor(protected textService: TextService, protected textState: TextState, protected colorService: ColorService) {
        super(textService, textState, colorService);
    }
    execute(): void {
        this.saveState();
        this.assignState();
        this.textService.addText();
        this.restoreState();
    }
    saveState(): void {
        this.savedState = new TextState(
            1,
            this.colorService.primaryColor,
            this.colorService.secondaryColor,
            { x: this.textService.topCorner.x, y: this.textService.topCorner.y },
            this.textService.textArea.value,
            {
                'font-size': this.textService.currentStyle['font-size'],
                'font-style': this.textService.currentStyle['font-style'],
                'font-weight': this.textService.currentStyle['font-weight'],
                'text-align': this.textService.currentStyle['text-align'],
                'font-family': this.textService.currentStyle['font-family'],
            },
            this.textService.textArea.style.width,
        );
    }
    restoreState(): void {
        this.changeState(this.savedState);
    }
    assignState(): void {
        this.changeState(this.textState);
    }

    changeState(state: TextState): void {
        super.changeState(state);
        this.textService.currentStyle['text-align'] = state.currentStyle['text-align'];
        this.textService.currentStyle['font-weight'] = state.currentStyle['font-weight'];
        this.textService.currentStyle['font-size'] = state.currentStyle['font-size'];
        this.textService.currentStyle['font-family'] = state.currentStyle['font-family'];
        this.textService.currentStyle['font-style'] = state.currentStyle['font-style'];
        this.textService.textArea.value = state.text;
        this.textService.textArea.style.width = state.textWidth;
        this.textService.topCorner = { x: state.topCorner.x, y: state.topCorner.y };
    }

    saveCanvas(): void {
        this.tool.saveCanvas();
    }
}
