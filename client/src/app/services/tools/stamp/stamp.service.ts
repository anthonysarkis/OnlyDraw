import { Injectable } from '@angular/core';
import { StampCommand } from '@app/classes/commands/stamp-command';
import { FIRST_ANGLE_MOUSE_WHEEL, IMAGE_PADDING, IMAGE_SIZE, MAX_ANGLE_DEGREE, MAX_SCALE, MIN_SCALE, SCALE_FACTOR } from '@app/classes/constants';
import { StampState } from '@app/classes/state/stamp-state';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    backgroundImage: HTMLImageElement;
    private currentAngle: number;
    private currentScale: number;
    currentImageNumber: number;
    stampVisualisation: CanvasRenderingContext2D;
    images: string[];

    get stampAngle(): number {
        return this.currentAngle;
    }

    set stampAngle(newAngle: number) {
        this.currentAngle = Math.min(Math.max(0, newAngle), MAX_ANGLE_DEGREE);
    }

    get stampScale(): number {
        return this.currentScale;
    }

    set stampScale(newScale: number) {
        this.currentScale = Math.min(Math.max(MIN_SCALE * SCALE_FACTOR, newScale), MAX_SCALE * SCALE_FACTOR);
    }

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.images = [
            './assets/rose.svg',
            './assets/whale.svg',
            './assets/clown-fish.svg',
            './assets/herb.svg',
            './assets/leaf.svg',
            './assets/grass.svg',
            './assets/rocket.png',
            './assets/diamond.png',
            './assets/moon.png',
            './assets/cloud.svg',
            './assets/soil.svg',
            './assets/dirt.svg',
            './assets/pickaxe.png',
            './assets/torch.png',
            './assets/wood.png',
            './assets/circle-finger.png',
            './assets/hand.png',
            './assets/harambe.png',
        ];
        this.name = ToolNames.Stamp;
        this.key = ToolKeys.Stamp;
        this.backgroundImage = new Image();
        this.currentScale = MIN_SCALE * SCALE_FACTOR;
        this.currentImageNumber = 0;
        this.currentAngle = 0;
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button !== MouseButton.Left) return;
        this.drawStamp();
        this.addCommand();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.changeStampImage(this.currentImageNumber);
        this.draw(this.drawingService.previewCtx);
    }

    onMouseWheel(event: WheelEvent): void {
        let angleToModify = FIRST_ANGLE_MOUSE_WHEEL;
        let rotationDirection = 1;
        if (event.deltaY < 0) rotationDirection = -rotationDirection;
        if (event.altKey) angleToModify = 1;
        this.currentAngle = this.currentAngle + angleToModify * rotationDirection;

        if (this.currentAngle > MAX_ANGLE_DEGREE) this.currentAngle = FIRST_ANGLE_MOUSE_WHEEL;
        if (this.currentAngle < 0) this.currentAngle = MAX_ANGLE_DEGREE - FIRST_ANGLE_MOUSE_WHEEL;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.changeStampImage(this.currentImageNumber);
        this.draw(this.drawingService.previewCtx);
    }

    changeStampImage(imageNumber: number): void {
        this.drawingService.clearCanvas(this.stampVisualisation);
        this.currentImageNumber = imageNumber;
        this.confirmStamp();
        this.stampVisualisation.drawImage(this.backgroundImage, 0, 0, this.backgroundImage.width / 2, this.backgroundImage.height / 2);
    }

    drawStamp(): void {
        this.changeStampImage(this.currentImageNumber);
        this.draw(this.drawingService.baseCtx);
        this.drawingService.saveCanvas();
        this.changeStampImage(this.currentImageNumber);
    }

    private draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const mousePosition = {
            x: this.mouseDownCoord.x - this.backgroundImage.width / IMAGE_PADDING,
            y: this.mouseDownCoord.y - this.backgroundImage.width / IMAGE_PADDING,
        };
        const IMAGE_BORDER_PERCENTAGE = this.currentScale / 2;
        const imageBorderHeight = this.backgroundImage.height * IMAGE_BORDER_PERCENTAGE;
        const imageBorderWidth = this.backgroundImage.width * IMAGE_BORDER_PERCENTAGE;
        ctx.translate(mousePosition.x + imageBorderWidth, mousePosition.y + imageBorderHeight);
        ctx.rotate(this.degreeToRadian(this.currentAngle));
        ctx.translate(-mousePosition.x - imageBorderWidth, -mousePosition.y - imageBorderHeight);
        ctx.drawImage(
            this.backgroundImage,
            mousePosition.x,
            mousePosition.y,
            this.backgroundImage.width * this.currentScale,
            this.backgroundImage.height * this.currentScale,
        );
        ctx.restore();
    }

    private degreeToRadian(currentAngle: number): number {
        return currentAngle / (MAX_ANGLE_DEGREE / 2 / Math.PI);
    }
    private confirmStamp(): void {
        this.backgroundImage.src = this.images[this.currentImageNumber];
        this.backgroundImage.width = IMAGE_SIZE;
        this.backgroundImage.height = IMAGE_SIZE;
    }

    private addCommand(): void {
        const currentState = new StampState(this.currentAngle, this.currentScale, this.currentImageNumber, this.mouseDownCoord);
        const command = new StampCommand(this, currentState);
        this.drawingService.undoRedoService.addCommand(command);
    }
}
