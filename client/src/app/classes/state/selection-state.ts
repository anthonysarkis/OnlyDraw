import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';
import { Shape } from '@app/interfaces/shape';
import { ToolState } from './tool-state';

export class SelectionState extends ToolState {
    constructor(
        lineWidth: number,
        primaryColor: Color,
        secondaryColor: Color,
        public currentDimensions: Dimensions,
        public currentCorner: Vec2,
        public selectedImage: HTMLImageElement,
        public shape: Shape,
        public shapeDimensions: Dimensions,
        public initialShapeCoord: Vec2,
        public initialShapeDimensions: Dimensions,
        public isPasted: boolean,
        public transformations: boolean[],
    ) {
        super(lineWidth, primaryColor, secondaryColor);
    }
}
