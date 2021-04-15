import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ToolState } from './tool-state';

export class TracerState extends ToolState {
    constructor(lineWidth: number, primaryColor: Color, secondaryColor: Color, public pathData: Vec2[]) {
        super(lineWidth, primaryColor, secondaryColor);
        this.pathData = pathData;
    }
}
