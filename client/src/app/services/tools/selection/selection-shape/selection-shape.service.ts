import { Injectable } from '@angular/core';
import { DEFAULT_LINE_DASH, END, SELECTION_CONTAINER, SELECTION_FILL, SELECTION_ZONE_COLOR, START } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ClipboardKeys } from '@app/enums/clipboard-keys';
import { MouseButton } from '@app/enums/mouse-buttons';
import { Dimensions } from '@app/interfaces/dimensions';
import { Shape } from '@app/interfaces/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { MathService } from '@app/services/math/math.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionShapeService extends Tool {
    private corners: Vec2[];
    private dimensions: Dimensions;
    shape: Shape;

    constructor(
        protected drawingService: DrawingService,
        protected shapeService: ShapeService,
        public selectionService: SelectionService,
        protected imageService: ImageHelperService,
        protected mathService: MathService,
        public clipboard: ClipboardService,
    ) {
        super(drawingService);
        this.dimensions = { width: 0, height: 0 };
        this.corners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
    }

    initializeProperties(): void {
        this.drawingService.baseCtx.lineWidth = 2;
        this.drawingService.previewCtx.lineWidth = 2;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.selectionService.isSelected) this.cancelSelection(event);
        this.mouseDown = event.button === MouseButton.Left;
        this.shapeService.isBordered = true;
        this.shapeService.onMouseDown(event);
        this.corners[START] = this.getPositionFromMouse(event);
        this.setContextStyle();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.clickedOutside(event) || !this.mouseDown) return;

        this.mouseDown = false;
        this.shapeService.mouseDown = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.restoreContextStyle();

        this.shape = this.shapeService.isAlternateShape ? this.shapeService.alternateShape : this.shapeService.mainShape;
        this.calculateFinalPositions(event);

        if (this.dimensions.width > 0 && this.dimensions.height > 0) this.makeImage();
        this.shapeService.isAlternateShape = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.selectionService.isSelected || !this.mouseDown) return;
        const newEvent = this.limitEventPositionToBorder(event);
        this.shapeService.onMouseMove(newEvent);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') this.endDrawing();
        if (!this.mouseDown) this.onClipboardKeyDown(event);
        if (this.selectionService.isSelected) return;
        this.shapeService.onKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.selectionService.isSelected) return;
        this.shapeService.onKeyUp(event);
    }

    endDrawing(): void {
        this.mouseDown = false;
        this.selectionService.endDrawing();
        this.selectionService.isSelected = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.dimensions = { width: 0, height: 0 };
        this.resetShapeDimensions();
        this.restoreContextStyle();
    }

    private onClipboardKeyDown(event: KeyboardEvent): void {
        if (event.key === ClipboardKeys.Delete) {
            this.clipboard.delete();
            this.endDrawing();
            return;
        }
        if (!event.ctrlKey) return;
        switch (event.key) {
            case ClipboardKeys.Copy:
                this.clipboard.copy();
                break;
            case ClipboardKeys.Paste:
                this.clipboard.paste();
                break;
            case ClipboardKeys.Cut:
                this.clipboard.cut();
                this.endDrawing();
                break;
        }
    }

    private clickedOutside(event: MouseEvent): boolean {
        if (this.selectionService.isSelected && !this.selectionService.isBorderSelected && !this.selectionService.mouseDown) {
            this.cancelSelection(event);
            return true;
        }
        this.selectionService.isBorderSelected = false;
        return false;
    }

    private cancelSelection(event: MouseEvent): void {
        if ((event.target as HTMLElement).id === SELECTION_CONTAINER) return;
        this.mouseDown = false;
        this.selectionService.endDrawing();
        this.selectionService.isSelected = false;
        this.selectionService.isBorderSelected = false;
        this.resetShapeDimensions();
        this.restoreContextStyle();
    }

    private makeImage(): void {
        const imageElement = this.imageService.getSelectedImage(this.corners[START], this.dimensions);
        this.setShapeState({ width: this.shape.width as number, height: this.shape.height as number });
        this.selectionService.initializeSelection(this.dimensions, this.corners[START], this.shapeService.mouseDownCoord);
        setTimeout(() => {
            this.selectionService.initializeImage(imageElement, this.shape, false);
        });
    }

    private setShapeState(dimensions: Dimensions): void {
        this.shape.width = Math.abs(dimensions.width);
        this.shape.height = Math.abs(dimensions.height);
    }

    private calculateFinalPositions(event: MouseEvent): void {
        this.corners[END] = this.getPositionFromMouse(this.limitEventPositionToBorder(event));
        const width = this.shape.width as number;
        const height = this.shape.height as number;
        this.mathService.absoluteDimensions(this.dimensions, width, height);
        this.mathService.calculateShiftedCorners(this.corners, width, height);
        this.checkIfCornerSwap();
        this.mathService.roundVec2(this.corners[START]);
        this.mathService.roundVec2(this.corners[END]);
    }

    private limitEventPositionToBorder(event: MouseEvent): MouseEvent {
        const position = this.getPositionFromMouse(event);
        this.corners[END].x = this.getPositionInCanvas(position.x, this.drawingService.canvas.width);
        this.corners[END].y = this.getPositionInCanvas(position.y, this.drawingService.canvas.height);
        return {
            ...event,
            clientX: Math.round(this.corners[END].x + this.drawingService.canvas.getBoundingClientRect().left),
            clientY: Math.round(this.corners[END].y + this.drawingService.canvas.getBoundingClientRect().top),
        };
    }

    private getPositionInCanvas(positionValue: number, canvasSize: number): number {
        if (positionValue > canvasSize) return canvasSize;
        if (positionValue < 0) return 0;
        return positionValue;
    }

    private checkIfCornerSwap(): void {
        if (this.corners[START].x > this.corners[END].x) this.mathService.swapCorners(this.corners, 'x');
        if (this.corners[START].y > this.corners[END].y) this.mathService.swapCorners(this.corners, 'y');
    }

    private resetShapeDimensions(): void {
        this.shapeService.mainShape.width = 0;
        this.shapeService.mainShape.height = 0;
        this.shapeService.alternateShape.width = 0;
        this.shapeService.alternateShape.height = 0;
        this.shapeService.isAlternateShape = false;
        if (this.shape) {
            this.shape.width = 0;
            this.shape.height = 0;
        }
    }

    private setContextStyle(): void {
        this.drawingService.baseCtx.save();
        this.drawingService.previewCtx.save();
        this.drawingService.baseCtx.fillStyle = SELECTION_FILL;
        this.drawingService.previewCtx.fillStyle = SELECTION_FILL;
        this.drawingService.baseCtx.strokeStyle = SELECTION_ZONE_COLOR;
        this.drawingService.previewCtx.strokeStyle = SELECTION_ZONE_COLOR;
        this.drawingService.previewCtx.setLineDash([DEFAULT_LINE_DASH, DEFAULT_LINE_DASH]);
        this.drawingService.baseCtx.setLineDash([DEFAULT_LINE_DASH, DEFAULT_LINE_DASH]);
    }

    private restoreContextStyle(): void {
        this.shapeService.restoreContextStyle();
        this.drawingService.baseCtx.restore();
        this.drawingService.previewCtx.restore();
    }
}
