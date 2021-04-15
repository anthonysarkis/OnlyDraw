import { Color } from '@app/classes/color';
import { ToolState } from './tool-state';

export class BucketState extends ToolState {
    constructor(lineWidth: number, primaryColor: Color, secondaryColor: Color, public imageData: ImageData) {
        super(lineWidth, primaryColor, secondaryColor);
    }
}
