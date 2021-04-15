import { Vec2 } from '@app/classes/vec2';

export class StampState {
    startingCoord: Vec2;

    constructor(public currentAngle: number, public currentScale: number, public currentImageNumber: number, startingCoord: Vec2) {
        this.currentAngle = currentAngle;
        this.currentScale = currentScale;
        this.startingCoord = startingCoord;
        this.currentImageNumber = currentImageNumber;
    }
}
