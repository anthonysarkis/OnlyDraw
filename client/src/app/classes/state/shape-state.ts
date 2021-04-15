import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { Shape } from '@app/interfaces/shape';
import { ToolState } from './tool-state';

export class ShapeState extends ToolState {
    constructor(
        public alternateShape: Shape,
        public mainShape: Shape,
        lineWidth: number,
        primaryColor: Color,
        secondaryColor: Color,
        public isAlternateShape: boolean,
        public isFilled: boolean,
        public isBordered: boolean,
        public mouseDownCoord: Vec2,
        public lastMousePosition: Vec2,
    ) {
        super(lineWidth, primaryColor, secondaryColor);
        this.mainShape = mainShape;
        this.alternateShape = alternateShape;
        this.isAlternateShape = isAlternateShape;
        this.isBordered = isBordered;
        this.isFilled = isFilled;
        this.mouseDownCoord = mouseDownCoord;
        this.lastMousePosition = lastMousePosition;
    }
}
