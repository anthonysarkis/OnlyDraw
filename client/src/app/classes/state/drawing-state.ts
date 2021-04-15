import { Color } from '@app/classes/color';
import { ToolState } from './tool-state';

export class DrawingState extends ToolState {
    constructor(lineWidth: number, primaryColor: Color, secondaryColor: Color, public selectedImage: HTMLImageElement) {
        super(lineWidth, primaryColor, secondaryColor);
    }
}
