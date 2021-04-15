import { Component } from '@angular/core';
import { Color } from '@app/classes/color';
import { INDEX_BLUE, INDEX_GREEN, INDEX_RED } from '@app/classes/constants';
import { ColorData } from '@app/enums/color-data';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent {
    isHiddenColorPannel: boolean;
    private inputHex: string[];

    constructor(public colorService: ColorService) {
        this.isHiddenColorPannel = false;
        this.inputHex = [];
        this.inputHex[ColorData.Red] = this.colorService.primaryColor.hex.slice(0, INDEX_RED);
        this.inputHex[ColorData.Green] = this.colorService.primaryColor.hex.slice(INDEX_RED, INDEX_GREEN);
        this.inputHex[ColorData.Blue] = this.colorService.primaryColor.hex.slice(INDEX_GREEN, INDEX_BLUE);
    }

    onRgbaInputChange(event: InputEvent, position: number): void {
        event.preventDefault();
        this.inputHex[position] = (event.target as HTMLInputElement).value;
        const colorHex = `#${this.inputHex[ColorData.Red]}${this.inputHex[ColorData.Green]}${this.inputHex[ColorData.Blue]}`;
        if (!this.colorService.validateHexInput(colorHex)) return;

        const newColor = new Color(
            parseInt(this.inputHex[ColorData.Red], 16),
            parseInt(this.inputHex[ColorData.Green], 16),
            parseInt(this.inputHex[ColorData.Blue], 16),
            1,
        );
        this.colorService.hue = newColor;
        this.colorService.assignColor(newColor);
    }

    private togglePannel(): void {
        this.isHiddenColorPannel = !this.isHiddenColorPannel;
    }

    onConfirmColor(): void {
        this.colorService.confirmColor();
        this.togglePannel();
    }

    onCancelColor(): void {
        this.colorService.cancelColorChange();
        this.togglePannel();
    }

    onClickColorButton(isPrimary: boolean): void {
        this.colorService.isPrimaryColor = isPrimary;
        this.togglePannel();
    }
}
