import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ToolState } from './tool-state';

export class AerosolState extends ToolState {
    constructor(
        lineWidth: number,
        primaryColor: Color,
        secondaryColor: Color,
        public pathData: Set<Vec2>,
        public fullPathData: Vec2[],
        public pointSize: number,
    ) {
        super(lineWidth, primaryColor, secondaryColor);
        this.pathData = pathData;
        this.fullPathData = fullPathData;
        this.pointSize = pointSize;
    }
}
