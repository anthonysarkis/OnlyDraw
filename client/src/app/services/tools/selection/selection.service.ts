import { Injectable } from '@angular/core';
import { SelectionCommand } from '@app/classes/commands/selection-command';
import { DEFAULT_OFFSET, FILL_COLOR, INCREMENT_TIME_STEP, PRESSED_TIME_STEP, SELECTION_ANCHOR_OFFSET } from '@app/classes/constants';
import { LassoShape } from '@app/classes/shapes/lasso-shape';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { SelectionState } from '@app/classes/state/selection-state';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { Dimensions } from '@app/interfaces/dimensions';
import { Shape } from '@app/interfaces/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { ResizeService } from '@app/services/tools/selection/resize/resize.service';
import { MagnetismeService } from './magnetisme/magnetisme.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private oldDimensions: Dimensions;
    private oldCorner: Vec2;
    currentDimensions: Dimensions;
    currentCorner: Vec2;

    selectedImage: HTMLImageElement;
    imageWithBorder: HTMLImageElement;
    isSelected: boolean;
    isBorderSelected: boolean;
    shape: Shape;
    initialShapeCoord: Vec2;
    initialShapeDimensions: Dimensions;
    isPasted: boolean;
    xTransformation: boolean;
    yTransformation: boolean;

    private keyBindings: Map<string, [boolean, Vec2]>;
    private keyMoveInterval: number;
    private keyMoveTimeout: number;
    private keyIncrementation: Vec2;

    constructor(
        public drawingService: DrawingService,
        public imageService: ImageHelperService,
        public resizeService: ResizeService,
        public magnetism: MagnetismeService,
    ) {
        super(drawingService);
        this.isSelected = false;
        this.isBorderSelected = false;
        this.currentDimensions = { width: 0, height: 0 };
        this.oldDimensions = { width: 0, height: 0 };
        this.currentCorner = { x: 0, y: 0 };
        this.oldCorner = { x: 0, y: 0 };
        this.initialShapeCoord = { x: 0, y: 0 };
        this.initialShapeDimensions = { width: 0, height: 0 };
        this.isPasted = false;
        this.xTransformation = false;
        this.yTransformation = false;
        this.imageWithBorder = new Image();

        this.resizeService.updateDimensions(this.currentDimensions.width, this.currentDimensions.height);
        this.updateAnchorPositions(this.currentDimensions, SELECTION_ANCHOR_OFFSET);
        this.setupKeys();
    }

    initializeImage(image: HTMLImageElement, shape: Shape, pasted: boolean): void {
        if (this.ctx) this.ctx.clearRect(0, 0, this.currentDimensions.width, this.currentDimensions.height);
        this.resizeService.isShiftDown = false;
        this.resizeService.updateDimensions(this.currentDimensions.width, this.currentDimensions.height);
        this.resizeService.updateCorners(this.currentCorner, this.currentDimensions);
        this.selectedImage = image;
        this.shape = shape;
        this.setInitialProperties(this.currentCorner, this.currentDimensions);
        this.isPasted = pasted;
        if (!this.isPasted) this.fillShapeWhite();
        this.initializeImageWithBorders();
        setTimeout(() => {
            this.ctx.drawImage(this.imageWithBorder, 0, 0, this.currentDimensions.width, this.currentDimensions.height);
        });
    }

    onMouseDown(event: MouseEvent): void {
        if (!this.isSelected) return;
        this.mouseDown = true;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.oldDimensions.width = this.currentDimensions.width;
        this.oldDimensions.height = this.currentDimensions.height;
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.oldCorner = { x: this.currentCorner.x, y: this.currentCorner.y };
        this.drawImage(this.imageWithBorder);
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) return;
        const mousePosition = this.getPositionFromMouse(event);
        const incrementation = this.calculateMouseIncrementation(mousePosition);
        this.translateCanvas(incrementation, '');
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') this.endDrawing();
        if (event.key === 'Shift' && !this.resizeService.isShiftDown) this.resizeService.isShiftDown = true;
        if (!this.isValidKeyDown(event)) return;
        this.setKeyDownValue(event.key, true);
        this.updateKeyIncrementation(event.key, true);
        this.oldCorner = { x: this.currentCorner.x, y: this.currentCorner.y };
        if (this.keyMoveInterval) return;
        this.translateCanvas(this.keyIncrementation, event.key);
        this.startShifting(event.key);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.isSelected) this.resizeService.isShiftDown = false;
        if (!this.isSelected || !this.keyBindings.has(event.key)) return;
        this.setKeyDownValue(event.key, false);
        this.updateKeyIncrementation(event.key, false);
        if (!this.checkIfAnyKeyIsPressed()) this.clearShifting();
    }

    endDrawing(): void {
        this.clearShifting();
        if (!this.isSelected) return;
        this.isSelected = false;
        this.mouseDown = false;
        if (this.hasSelectionBeenMoved()) this.addCommand();
        this.drawSelection();
        this.resetReziseProperties();
    }

    drawSelection(): void {
        this.drawingService.baseCtx.save();
        this.imageWithBorder.src = this.canvas.toDataURL();
        this.getFullCanvasImage(this.selectedImage);
        setTimeout(() => {
            this.imageService.drawOnBaseCtx(this.selectedImage, this.currentCorner, this.currentDimensions);
            this.drawingService.baseCtx.restore();
            this.drawingService.saveCanvas();
        });
    }

    getFullCanvasImage(selectedImage: HTMLImageElement): void {
        this.ctx.clearRect(0, 0, this.currentDimensions.width, this.currentDimensions.height);
        this.ctx.drawImage(this.selectedImage, 0, 0, this.currentDimensions.width, this.currentDimensions.height);
        selectedImage.src = this.canvas.toDataURL();
        this.ctx.clearRect(0, 0, this.currentDimensions.width, this.currentDimensions.height);
        this.ctx.drawImage(this.imageWithBorder, 0, 0, this.currentDimensions.width, this.currentDimensions.height);
    }

    fillShapeWhite(): void {
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.fillStyle = FILL_COLOR;
        this.shape.drawFill(this.drawingService.baseCtx, this.initialShapeCoord);
        if (this.shape instanceof LassoShape) {
            this.drawingService.baseCtx.clip();
            this.drawingService.baseCtx.fill();
        }
        this.drawingService.baseCtx.restore();
    }

    private calculateMouseIncrementation(mousePosition: Vec2): Vec2 {
        const incrementation: Vec2 = { x: 0, y: 0 };
        incrementation.x = mousePosition.x - this.mouseDownCoord.x;
        incrementation.y = mousePosition.y - this.mouseDownCoord.y;
        return incrementation;
    }

    private updateKeyIncrementation(key: string, increment: boolean): void {
        const offset = (this.keyBindings.get(key) as [boolean, Vec2])[1];
        this.keyIncrementation.x += increment ? offset.x : -offset.x;
        this.keyIncrementation.y += increment ? offset.y : -offset.y;
    }

    private startShifting(key: string): void {
        this.keyMoveTimeout = window.setTimeout(() => {
            clearTimeout(this.keyMoveTimeout);
            if (!this.checkIfKeyDown(key)) return;
            this.shiftTranslate(key);
            this.keyMoveInterval = window.setInterval(() => {
                this.shiftTranslate(key);
            }, INCREMENT_TIME_STEP);
        }, PRESSED_TIME_STEP);
    }

    private clearShifting(): void {
        this.keyIncrementation = { x: 0, y: 0 };
        clearInterval(this.keyMoveInterval);
        this.keyMoveInterval = 0;
        clearTimeout(this.keyMoveTimeout);
        this.keyMoveTimeout = 0;
    }

    private setupKeys(): void {
        this.bindKeys();
        this.keyIncrementation = { x: 0, y: 0 };
        this.keyMoveInterval = 0;
        this.keyMoveTimeout = 0;
    }

    private bindKeys(): void {
        this.keyBindings = new Map();
        this.keyBindings.set(ArrowKeys.Up, [false, { x: 0, y: -DEFAULT_OFFSET }]);
        this.keyBindings.set(ArrowKeys.Right, [false, { x: DEFAULT_OFFSET, y: 0 }]);
        this.keyBindings.set(ArrowKeys.Down, [false, { x: 0, y: DEFAULT_OFFSET }]);
        this.keyBindings.set(ArrowKeys.Left, [false, { x: -DEFAULT_OFFSET, y: 0 }]);
    }

    private setKeyDownValue(key: string, isPressed: boolean): void {
        const element = this.keyBindings.get(key) as [boolean, Vec2];
        this.keyBindings.set(key, [isPressed, element[1]]);
    }

    private checkIfKeyDown(key: string): boolean {
        return this.keyBindings.has(key) && (this.keyBindings.get(key) as [boolean, Vec2])[0];
    }
    private checkIfAnyKeyIsPressed(): boolean {
        for (const [, [value]] of this.keyBindings) {
            if (value) return true;
        }
        return false;
    }

    private isValidKeyDown(event: KeyboardEvent): boolean {
        return this.isSelected && !this.checkIfKeyDown(event.key) && this.keyBindings.has(event.key);
    }

    private translateCanvas(incrementation: Vec2, pressedKey: string): void {
        const applyKeyJump = this.shouldApplyMagnetKeyJump(pressedKey);
        if (!applyKeyJump) this.currentCorner = { x: this.oldCorner.x + incrementation.x, y: this.oldCorner.y + incrementation.y };
        this.currentCorner = this.magnetism.adjustCorner(this.currentCorner, this.currentDimensions);
        if (applyKeyJump) {
            this.magnetism.jumpSquare(this.currentCorner, pressedKey);
            this.oldCorner = { x: this.currentCorner.x, y: this.currentCorner.y };
        }
        this.resizeService.updateCorners(this.currentCorner, this.currentDimensions);
    }

    private shouldApplyMagnetKeyJump(pressedKey: string): boolean {
        if (this.magnetism.applyMagnet && this.keyBindings.get(pressedKey)) return true;
        return false;
    }

    private shiftTranslate(key: string): void {
        this.translateCanvas(this.keyIncrementation, key);
        this.oldCorner = { x: this.currentCorner.x, y: this.currentCorner.y };
    }

    private resetReziseProperties(): void {
        this.xTransformation = false;
        this.yTransformation = false;
        this.resizeService.resetProperties();
    }

    private setInitialProperties(corner: Vec2, dimensions: Dimensions): void {
        this.initialShapeCoord = { x: corner.x, y: corner.y };
        this.initialShapeDimensions = { width: dimensions.width, height: dimensions.height };
    }

    private initializeImageWithBorders(): void {
        this.imageWithBorder.width = this.currentDimensions.width;
        this.imageWithBorder.height = this.currentDimensions.height;
        if (!this.isPasted) this.imageWithBorder.src = this.imageService.getClippedImage(this.selectedImage, this.shape, this.currentDimensions);
    }

    drawImage(image: HTMLImageElement): void {
        this.applyTransformation(this.ctx);
        this.ctx.drawImage(image, 0, 0, this.currentDimensions.width, this.currentDimensions.height);
    }

    applyTransformation(ctx: CanvasRenderingContext2D): void {
        if (this.xTransformation && this.yTransformation) {
            ctx.setTransform(-this.xTransformation, 0, 0, -this.yTransformation, this.canvas.width, this.canvas.height);
            return;
        }
        if (this.xTransformation) ctx.setTransform(-this.xTransformation, 0, 0, 1, this.canvas.width, 0);
        if (this.yTransformation) ctx.setTransform(1, 0, 0, -this.yTransformation, 0, this.canvas.height);
    }

    setDimensions(newDimensions: Dimensions): void {
        this.currentDimensions = { width: Math.round(newDimensions.width), height: Math.round(newDimensions.height) };
        this.oldDimensions = { width: Math.round(newDimensions.width), height: Math.round(newDimensions.height) };
    }

    setCorners(newCorners: Vec2): void {
        this.currentCorner = { x: Math.round(newCorners.x), y: Math.round(newCorners.y) };
        this.oldCorner = { x: Math.round(newCorners.x), y: Math.round(newCorners.y) };
    }

    selectAll(): void {
        setTimeout(() => {
            this.isSelected = true;
            this.shape = new Rectangle(this.drawingService.canvas.width, this.drawingService.canvas.height);
            this.setDimensions({ width: this.drawingService.canvas.width, height: this.drawingService.canvas.height });
            this.setCorners({ x: 0, y: 0 });
            this.updateAnchorPositions(this.currentDimensions, SELECTION_ANCHOR_OFFSET);
            const image = this.imageService.getSelectedImage({ x: 0, y: 0 });
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            setTimeout(() => {
                this.initializeImage(image, new Rectangle(this.drawingService.canvas.width, this.drawingService.canvas.height), false);
            });
        });
    }

    initializeSelection(dimensions: Dimensions, cornerPosition: Vec2, initialCoord: Vec2): void {
        this.isSelected = true;
        this.setInitialProperties(initialCoord, dimensions);
        this.setDimensions(dimensions);
        this.setCorners(cornerPosition);
        this.updateAnchorPositions(dimensions, SELECTION_ANCHOR_OFFSET);
    }

    updateAnchorPositions(dimensions: Dimensions, offset: number): void {
        this.resizeService.updateAnchors(dimensions, offset);
    }

    addCommand(): void {
        const currentState = new SelectionState(
            1,
            this.drawingService.colorService.primaryColor,
            this.drawingService.colorService.secondaryColor,
            { width: this.currentDimensions.width, height: this.currentDimensions.height },
            { x: this.currentCorner.x, y: this.currentCorner.y },
            this.selectedImage,
            this.shape,
            { width: this.shape.width as number, height: this.shape.height as number },
            { x: this.initialShapeCoord.x, y: this.initialShapeCoord.y },
            { width: this.initialShapeDimensions.width, height: this.initialShapeDimensions.height },
            this.isPasted,
            [this.xTransformation, this.yTransformation],
        );
        const command = new SelectionCommand(this, currentState, this.drawingService.colorService);
        this.drawingService.undoRedoService.addCommand(command);
    }
    private hasSelectionBeenMoved(): boolean {
        return !(
            this.initialShapeCoord.x === this.currentCorner.x &&
            this.initialShapeCoord.y === this.currentCorner.y &&
            this.currentDimensions.width === this.shape.width &&
            this.currentDimensions.height === this.shape.height
        );
    }
}
