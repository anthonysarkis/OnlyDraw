import { Color } from '@app/classes/color';

export abstract class ToolState {
    constructor(public lineWidth: number, public primaryColor: Color, public secondaryColor: Color) {
        this.lineWidth = lineWidth;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
    }
}
