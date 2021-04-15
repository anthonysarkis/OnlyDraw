import { Component } from '@angular/core';
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from '@app/classes/constants';
import { TextService } from '@app/services/tools/text/text.service';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss'],
})
export class TextComponent {
    fontSize: number;
    minFontSize: number;
    maxFontSize: number;
    font: string;
    fonts: string[];
    constructor(public textService: TextService) {
        this.fontSize = Number(this.textService.currentStyle['font-size'].replace('px', ''));
        this.minFontSize = MIN_FONT_SIZE;
        this.maxFontSize = MAX_FONT_SIZE;
        this.font = 'Georgia';
        this.fonts = ['Georgia', 'Arial', 'Helvetica', 'Papyrus', 'Copperplate'];
    }

    onFontChange(fontState: string[]): void {
        this.onFontStyleChange('normal');
        this.onFontWeightChange('normal');
        if (fontState.includes('bold')) this.onFontWeightChange('bold');
        if (fontState.includes('italic')) this.onFontStyleChange('italic');
    }

    onFontSizeChange(newFontSize: number): void {
        if (newFontSize > MAX_FONT_SIZE || newFontSize < MIN_FONT_SIZE) return;
        this.changeFontAttribute('font-size', newFontSize + 'px');
    }

    onFontStyleChange(newFontStyle: string): void {
        if (newFontStyle !== 'italic' && newFontStyle !== 'normal') return;
        this.changeFontAttribute('font-style', newFontStyle);
    }

    onTextAlignChange(newTextAlign: string): void {
        if (newTextAlign !== 'center' && newTextAlign !== 'left' && newTextAlign !== 'right') return;
        this.changeFontAttribute('text-align', newTextAlign);
    }

    onFontWeightChange(fontWeight: string): void {
        if (fontWeight !== 'bold' && fontWeight !== 'normal') return;
        this.changeFontAttribute('font-weight', fontWeight);
    }

    onFontFamilyChange(): void {
        this.changeFontAttribute('font-family', this.font);
    }

    private changeFontAttribute(attribute: 'font-size' | 'font-style' | 'font-weight' | 'text-align' | 'font-family', value: string): void {
        this.textService.currentStyle[attribute] = value;
        setTimeout(() => {
            this.textService.resizeTextBox();
            this.textService.textArea.focus();
        });
    }
}
