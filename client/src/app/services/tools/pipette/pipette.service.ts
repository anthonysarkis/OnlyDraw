import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import {
    CANVAS_CENTER_X,
    CANVAS_CENTER_Y,
    DROPPER_DIMENSIONS_X,
    DROPPER_DIMENSIONS_Y,
    DROPPER_LOCATION_X,
    DROPPER_LOCATION_Y,
    DROPPER_PADDING,
    DROPPER_SIZE,
    DROPPER_ZOOM_X,
    DROPPER_ZOOM_Y,
    EMPTY_COLOR,
    MAX_RGB,
} from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    // Je l'ai mis de type "any" car *imageSmoothingEnabled bug avec d'autre web browser, c'est encore en phase experimentale
    // tslint:disable:no-any
    dropperVisualisation: any;
    selectedColor: Color;
    backgroundImage: HTMLImageElement;
    newCanvas: HTMLCanvasElement;
    mouseOnCanvas: boolean;
    ctx: CanvasRenderingContext2D;
    private dropperColorPosition: Vec2;

    constructor(protected drawingService: DrawingService, private colorService: ColorService, private mathService: MathService) {
        super(drawingService);
        this.mouseOnCanvas = true;
        this.name = ToolNames.Pipette;
        this.key = ToolKeys.Pipette;
        this.backgroundImage = new Image();
    }

    onMouseDown(event: MouseEvent): void {
        if (!event.button) this.toChangePrimary(true);
        if (event.button === MouseButton.Right) this.toChangePrimary(false);
        this.changeSelectedColor();
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (this.mouseDownCoord.x < 0) return;
        this.colorService.confirmColor();
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (!this.mathService.isPointInCanvas(this.mouseDownCoord, this.drawingService.canvas.width, this.drawingService.canvas.height)) {
            this.mouseOnCanvas = false;
            return;
        }

        this.mouseOnCanvas = true;
        this.drawEmptyBackground();
        this.newCanvas = this.drawingService.canvas.cloneNode(true) as HTMLCanvasElement;
        this.drawCanvasWhiteBackground();
        this.removeImageSmoothing();

        this.drawImage();
        this.drawSquareInTheMiddle(this.dropperVisualisation);
    }

    private drawCanvasWhiteBackground(): void {
        this.ctx = this.newCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(0, 0, this.newCanvas.width, this.newCanvas.height);
        this.ctx.drawImage(this.drawingService.canvas, 0, 0);
    }

    private drawEmptyBackground(): void {
        this.backgroundImage.src = './assets/empty.png';
        this.dropperVisualisation.drawImage(this.backgroundImage, 0, 0);
    }

    private removeImageSmoothing(): void {
        this.dropperVisualisation.imageSmoothingEnabled = false;
        this.dropperVisualisation.webkitImageSmoothingEnabled = false;
        this.dropperVisualisation.mozImageSmoothingEnabled = false;
        this.dropperVisualisation.msImageSmoothingEnabled = false;
        this.dropperVisualisation.oImageSmoothingEnabled = false;
    }

    private drawSquareInTheMiddle(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.rect(DROPPER_LOCATION_X, DROPPER_LOCATION_Y, DROPPER_DIMENSIONS_X, DROPPER_DIMENSIONS_Y);
        context.stroke();
    }

    private toChangePrimary(isPrimary: boolean): void {
        this.colorService.isPrimaryColor = isPrimary;
    }

    private drawImage(): void {
        this.dropperVisualisation.drawImage(
            this.newCanvas,
            this.mouseDownCoord.x - DROPPER_PADDING,
            this.mouseDownCoord.y - DROPPER_PADDING,
            DROPPER_SIZE,
            DROPPER_SIZE,
            0,
            0,
            DROPPER_ZOOM_Y,
            DROPPER_ZOOM_X,
        );
    }

    private changeSelectedColor(): void {
        this.dropperColorPosition = { x: CANVAS_CENTER_X, y: CANVAS_CENTER_Y };
        this.selectedColor = this.colorService.onMouseMove(this.dropperColorPosition, this.dropperVisualisation, true);
        const whiteColor = new Color(MAX_RGB, MAX_RGB, MAX_RGB, 1);
        if (this.selectedColor.hex === EMPTY_COLOR) this.colorService.assignColor(whiteColor);
    }
}
