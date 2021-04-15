import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ToolState } from './tool-state';

export class LineState extends ToolState {
    constructor(
        lineWidth: number,
        primaryColor: Color,
        secondaryColor: Color,
        public pathData: Vec2[],
        public showJunctionPoints: boolean,
        public diameterOfPoint: number,
    ) {
        super(lineWidth, primaryColor, secondaryColor);
        this.pathData = pathData;
        this.diameterOfPoint = diameterOfPoint;
        this.showJunctionPoints = showJunctionPoints;
    }
}
