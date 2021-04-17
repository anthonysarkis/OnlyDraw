import { Injectable } from '@angular/core';
import { TextCommand } from '@app/classes/commands/text-command';
import { LINE_HEIGHT_SCALE } from '@app/classes/constants';
import { TextState } from '@app/classes/state/text-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { FontAttributes } from '@app/interfaces/font-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    topCorner: Vec2;
    isTextBoxActive: boolean;
    textArea: HTMLTextAreaElement;
    currentStyle: FontAttributes;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.name = ToolNames.Text;
        this.key = ToolKeys.Text;
        this.topCorner = { x: 0, y: 0 };
        this.mouseDown = false;
        this.isTextBoxActive = false;
        this.currentStyle = {
            'font-size': '12px',
            'font-style': 'normal',
            'font-weight': 'normal',
            'text-align': 'left',
            'font-family': 'Georgia',
        };
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Escape') return;
        this.textArea.value = '';
        this.endDrawing();
    }

    onMouseDown(event: MouseEvent): void {
        if (this.mouseDown) {
            if ((event.target as HTMLElement).className === 'textBox') return;
            this.addCommand();
            this.endDrawing();
            return;
        }
        this.activateTextBox(event);
    }

    addText(): void {
        this.setFont();
        this.calculateCorner(this.currentStyle['text-align']);
        const textSize = Number(this.currentStyle['font-size'].replace('px', '')) * LINE_HEIGHT_SCALE;
        const lineArray = this.textArea.value.split('\n');
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.fillStyle = this.drawingService.colorService.primaryColor.getRgb();
        for (let i = 0; i < lineArray.length; i++)
            this.drawingService.baseCtx.fillText(lineArray[i], this.topCorner.x, this.topCorner.y + (1 + i) * textSize);
        this.drawingService.baseCtx.restore();
    }

    private calculateCorner(textAlign: string): void {
        if (textAlign === 'center') {
            this.topCorner = {
                x: this.topCorner.x + Number(this.textArea.style.width.replace('px', '')) / 2,
                y: this.topCorner.y,
            };
            return;
        }
        if (textAlign === 'right') {
            this.topCorner = {
                x: this.topCorner.x + Number(this.textArea.style.width.replace('px', '')),
                y: this.topCorner.y,
            };
            return;
        }
    }

    getTextColor(): string {
        return this.drawingService.colorService.primaryColor.getRgb();
    }

    endDrawing(): void {
        this.isTextBoxActive = false;
        setTimeout(() => {
            this.addText();
            this.textArea.value = '';
            this.resetTextArea();
            this.textArea.blur();
            this.drawingService.saveCanvas();
        });
        this.mouseDown = false;
    }

    resizeTextBox(): void {
        if (!this.isTextBoxActive) return;
        const initalWidth = Number(this.textArea.style.width.replace('px', ''));
        this.resetTextArea();
        this.textArea.style.height = this.textArea.scrollHeight + 'px';
        this.textArea.style.width = this.textArea.scrollWidth + 'px';
        const currentWidth = Number(this.textArea.style.width.replace('px', ''));
        this.checkAlignment(currentWidth, initalWidth);
    }

    private checkAlignment(currentWidth: number, initalWidth: number): void {
        if (this.currentStyle['text-align'] === 'right') this.topCorner.x = this.topCorner.x - (currentWidth - initalWidth);
        if (this.currentStyle['text-align'] === 'center') this.topCorner.x = this.topCorner.x - (currentWidth - initalWidth) / 2;
    }

    private resetTextArea(): void {
        this.textArea.style.height = '';
        this.textArea.style.width = '';
    }

    private activateTextBox(event: MouseEvent): void {
        this.topCorner = this.getPositionFromMouse(event);
        this.mouseDown = true;
        this.isTextBoxActive = true;
        setTimeout(() => {
            this.textArea.focus();
        });
    }

    private setFont(): void {
        this.drawingService.baseCtx.font =
            this.currentStyle['font-style'] +
            ' ' +
            this.currentStyle['font-weight'] +
            ' ' +
            this.currentStyle['font-size'] +
            ' ' +
            this.currentStyle['font-family'];
        this.drawingService.baseCtx.textAlign = this.currentStyle['text-align'] as CanvasTextAlign;
    }

    addCommand(): void {
        if (this.textArea.value === '') return;
        const currentState = new TextState(
            1,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            { x: this.topCorner.x, y: this.topCorner.y },
            this.textArea.value,
            {
                'font-size': this.currentStyle['font-size'],
                'font-style': this.currentStyle['font-style'],
                'font-weight': this.currentStyle['font-weight'],
                'text-align': this.currentStyle['text-align'],
                'font-family': this.currentStyle['font-family'],
            },
            this.textArea.style.width,
        );
        const command = new TextCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
