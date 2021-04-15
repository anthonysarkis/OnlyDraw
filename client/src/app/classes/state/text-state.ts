import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { FontAttributes } from '@app/interfaces/font-attributes';
import { ToolState } from './tool-state';

export class TextState extends ToolState {
    constructor(
        public lineWidth: number,
        public primaryColor: Color,
        public secondaryColor: Color,
        public topCorner: Vec2,
        public text: string,
        public currentStyle: FontAttributes,
        public textWidth: string,
    ) {
        super(lineWidth, primaryColor, secondaryColor);
    }
}
