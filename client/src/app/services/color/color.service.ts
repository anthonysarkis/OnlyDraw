import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { COLOR_HISTORY_SIZE, MAX_RGB } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { ColorData } from '@app/enums/color-data';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ColorService {
    primaryColor: Color;
    secondaryColor: Color;
    hue: Color;
    isPrimaryColor: boolean;
    colorChanged: BehaviorSubject<boolean>;
    colorsHistory: Color[];
    private oldPrimaryColor: Color;
    private oldSecondaryColor: Color;

    constructor() {
        this.primaryColor = new Color(MAX_RGB, 0, 0, 1);
        this.secondaryColor = new Color(MAX_RGB, 0, 0, 1);
        this.oldPrimaryColor = new Color(MAX_RGB, 0, 0, 1);
        this.oldSecondaryColor = new Color(MAX_RGB, 0, 0, 1);
        this.hue = new Color(MAX_RGB, 0, 0, 1);
        this.isPrimaryColor = true;
        this.colorChanged = new BehaviorSubject(false);
        this.colorsHistory = [];
    }

    onMouseMove(position: Vec2, ctx: CanvasRenderingContext2D, hueChange: boolean): Color {
        const newColor = this.assignColorOfPosition(position, ctx);
        this.assignColor(newColor);
        if (hueChange) this.hue = newColor;
        return newColor;
    }

    switchPrimarySecondary(): void {
        [this.primaryColor, this.secondaryColor] = [this.secondaryColor, this.primaryColor];
        [this.oldPrimaryColor, this.oldSecondaryColor] = [this.oldSecondaryColor, this.oldPrimaryColor];
        this.colorChanged.next(true);
    }

    chooseCurrentColor(): Color {
        return this.isPrimaryColor ? this.primaryColor : this.secondaryColor;
    }

    confirmColor(): void {
        const currentColor = this.chooseCurrentColor();
        if (this.isNewColor(currentColor)) this.saveSelectedColor(currentColor);
        this.colorChanged.next(true);
        this.updateOldColor(currentColor);
    }

    cancelColorChange(): void {
        this.isPrimaryColor ? (this.primaryColor = this.oldPrimaryColor) : (this.secondaryColor = this.oldSecondaryColor);
    }

    private saveSelectedColor(addedColor: Color): void {
        if (this.colorsHistory.length >= COLOR_HISTORY_SIZE) {
            this.colorsHistory.pop();
        }
        this.colorsHistory.splice(0, 0, addedColor);
    }

    assignColor(newColor: Color): void {
        this.isPrimaryColor ? (this.primaryColor = newColor) : (this.secondaryColor = newColor);
    }

    private updateOldColor(newColor: Color): void {
        this.isPrimaryColor ? (this.oldPrimaryColor = newColor) : (this.oldSecondaryColor = newColor);
    }

    private isNewColor(colorCheck: Color): boolean {
        const hexCodeSize = 7;
        return !this.colorsHistory.some((color) => {
            return colorCheck.hex.substring(1, hexCodeSize) === color.hex.substring(1, hexCodeSize);
        });
    }

    validateHexInput(colorHex: string): boolean {
        // Pattern to validate if color starts with # and contains 6 consecutive hexadecimal based values
        const hexValidation = /^#[0-9a-f]{6}/i;
        return hexValidation.test(colorHex);
    }

    onSelectPrimaryColor(colorClicked: Color, isPrimary: boolean, event: MouseEvent): void {
        event.preventDefault();
        isPrimary ? (this.primaryColor = colorClicked) : (this.secondaryColor = colorClicked);
        isPrimary ? (this.oldPrimaryColor = colorClicked) : (this.oldSecondaryColor = colorClicked);
        this.colorChanged.next(true);
    }

    onSliderOpacityChanger(opacity: number): void {
        let currentColor = this.chooseCurrentColor();
        currentColor = new Color(currentColor.red, currentColor.green, currentColor.blue, opacity);
        this.assignColor(currentColor);
    }

    private assignColorOfPosition(mousePosition: Vec2, ctx: CanvasRenderingContext2D): Color {
        const imageData = ctx.getImageData(mousePosition.x, mousePosition.y, 1, 1).data;
        const red = imageData[ColorData.Red];
        const green = imageData[ColorData.Green];
        const blue = imageData[ColorData.Blue];
        const alpha = imageData[ColorData.Alpha] / MAX_RGB;
        return new Color(red, green, blue, alpha);
    }
}
