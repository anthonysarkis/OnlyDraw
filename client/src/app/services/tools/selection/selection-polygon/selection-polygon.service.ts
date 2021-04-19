import { Injectable } from '@angular/core';
import {
    DEFAULT_LINE_DASH,
    DEFAULT_LINE_THICKNESS,
    END,
    MIN_NUMBER_OF_SIDES,
    SELECTION_ANCHOR_OFFSET,
    SELECTION_CONTAINER,
    START,
} from '@app/classes/constants';
import { LassoShape } from '@app/classes/shapes/lasso-shape';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ClipboardKeys } from '@app/enums/clipboard-keys';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { Dimensions } from '@app/interfaces/dimensions';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { MathService } from '@app/services/math/math.service';
import { LineService } from '@app/services/tools/line/line.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionPolygonService extends Tool {
    private corners: Vec2[];
    private dimensions: Dimensions;
    private isInvalidSegment: boolean;

    constructor(
        protected drawingService: DrawingService,
        protected lineService: LineService,
        protected selectionService: SelectionService,
        protected imageService: ImageHelperService,
        protected mathService: MathService,
        protected clipboard: ClipboardService,
    ) {
        super(drawingService);
        this.name = ToolNames.Lasso;
        this.key = ToolKeys.Lasso;
        this.dimensions = { width: 0, height: 0 };
        this.corners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        this.isInvalidSegment = false;
    }

    initializeProperties(): void {
        this.drawingService.previewCtx.lineWidth = DEFAULT_LINE_THICKNESS;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.selectionService.isSelected) {
            this.cancelSelection(event);
            return;
        }
        if (this.isInvalidSegment) return;
        this.mouseDown = event.button === MouseButton.Left;
        this.setContextStyle();
        this.lineService.showJunctionPoints = false;
        this.lineService.onMouseDown(event);
        if (this.lineService.pathData.length <= MIN_NUMBER_OF_SIDES) return;
        const finalPosition = this.checkFinalPosition();
        if (this.lineService.pathData[0] === finalPosition) this.createSelection();
    }

    onMouseMove(event: MouseEvent): void {
        this.isInvalidSegment = false;
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.lineService.onMouseMove(event);
        const currentPoint = this.lineService.shiftDown ? this.lineService.shiftedPosition : this.getPositionFromMouse(event);
        for (let i = 0; i < this.lineService.pathData.length - 1; i++) {
            const intersectResult = this.intersect(
                this.lineService.pathData[i],
                this.lineService.pathData[i + 1],
                this.lineService.pathData[this.lineService.pathData.length - 1],
                currentPoint,
            );
            if (intersectResult) {
                this.drawInvalidRetroaction(currentPoint);
                return;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.clickedOutside(event)) return;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.mouseDown) this.onClipboardKeyDown(event);
        if (this.selectionService.isSelected) return;
        if (this.isInvalidSegment)
            this.drawInvalidRetroaction(this.lineService.shiftDown ? this.lineService.shiftedPosition : this.lineService.mouseDownCoord);
        this.lineService.onKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.selectionService.isSelected) return;
        this.lineService.onKeyUp(event);
        if (this.isInvalidSegment && event.key !== 'Escape')
            this.drawInvalidRetroaction(this.lineService.shiftDown ? this.lineService.shiftedPosition : this.lineService.mouseDownCoord);
    }

    private onClipboardKeyDown(event: KeyboardEvent): void {
        if (event.key === ClipboardKeys.Delete) {
            this.clipboard.delete();
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
                break;
        }
    }

    private makeImage(shape: LassoShape): void {
        const imageElement = this.imageService.getSelectedImage(this.corners[START], this.dimensions);
        this.initializeSelection();
        setTimeout(() => {
            this.selectionService.initializeImage(imageElement, shape, false);
        });
    }

    private initializeSelection(): void {
        this.selectionService.isSelected = true;
        this.selectionService.setDimensions(this.dimensions);
        this.selectionService.setCorners(this.corners[START]);
        this.selectionService.updateAnchorPositions(this.selectionService.currentDimensions, SELECTION_ANCHOR_OFFSET);
    }

    private calculateSelectionRectangle(): void {
        let minCoords: Vec2 = { x: this.lineService.pathData[0].x, y: this.lineService.pathData[0].y };
        let maxCoords: Vec2 = { x: this.lineService.pathData[0].x, y: this.lineService.pathData[0].y };
        for (const point of this.lineService.pathData) {
            minCoords = this.checkMinCoord(point, minCoords);
            maxCoords = this.checkMaxCoord(point, maxCoords);
        }
        this.corners[START] = minCoords;
        this.corners[END] = maxCoords;
        this.dimensions = { width: maxCoords.x - minCoords.x, height: maxCoords.y - minCoords.y };
    }

    private clickedOutside(event: MouseEvent): boolean {
        if (this.selectionService.isSelected && !this.mouseDown && !this.selectionService.mouseDown && !this.selectionService.isBorderSelected) {
            this.cancelSelection(event);
            return true;
        }
        this.selectionService.isBorderSelected = false;
        this.mouseDown = false;
        return false;
    }

    private createSelectionPathData(): Vec2[] {
        const pathData = [];
        for (const point of this.lineService.pathData) {
            const newPoint = { x: point.x - this.corners[START].x, y: point.y - this.corners[START].y };
            pathData.push(newPoint);
        }
        return pathData;
    }

    private cancelSelection(event: MouseEvent): void {
        if ((event.target as HTMLElement).id === SELECTION_CONTAINER) return;
        this.selectionService.endDrawing();
        this.selectionService.isSelected = false;
        this.selectionService.isBorderSelected = false;
        this.drawingService.previewCtx.setLineDash([]);
        this.drawingService.previewCtx.strokeStyle = this.drawingService.colorService.primaryColor.getRgb();
    }

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    private intersect(point1: Vec2, point2: Vec2, point3: Vec2, point4: Vec2): boolean {
        if ((point1.x === point2.x && point1.y === point2.y) || (point3.x === point4.x && point3.y === point4.y)) return false;

        if (point3.x === point2.x && point3.y === point2.y) return this.checkIfSameSlope(point4);

        const denominator = (point4.y - point3.y) * (point2.x - point1.x) - (point4.x - point3.x) * (point2.y - point1.y);
        if (denominator === 0) return false;

        const ua = ((point4.x - point3.x) * (point1.y - point3.y) - (point4.y - point3.y) * (point1.x - point3.x)) / denominator;
        const ub = ((point2.x - point1.x) * (point1.y - point3.y) - (point2.y - point1.y) * (point1.x - point3.x)) / denominator;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return false;
        return true;
    }

    private checkIfSameSlope(currentPoint: Vec2): boolean {
        const slope1 =
            (this.lineService.pathData[this.lineService.pathData.length - 2].y - this.lineService.pathData[this.lineService.pathData.length - 1].y) /
            (this.lineService.pathData[this.lineService.pathData.length - 2].x - this.lineService.pathData[this.lineService.pathData.length - 1].x);
        const slope2 =
            (this.lineService.pathData[this.lineService.pathData.length - 1].y - currentPoint.y) /
            (this.lineService.pathData[this.lineService.pathData.length - 1].x - currentPoint.x);
        if (Math.abs(slope1) === Math.abs(slope2))
            return this.checkIfInsideLineSegment(
                this.lineService.pathData[this.lineService.pathData.length - 2],
                this.lineService.pathData[this.lineService.pathData.length - 1],
                currentPoint,
            );
        return false;
    }

    private checkIfInsideLineSegment(line1: Vec2, line2: Vec2, point: Vec2): boolean {
        const L2 = (line2.x - line1.x) * (line2.x - line1.x) + (line2.y - line1.y) * (line2.y - line1.y);
        if (L2 === 0) return false;
        const r = ((point.x - line1.x) * (line2.x - line1.x) + (point.y - line1.y) * (line2.y - line1.y)) / L2;
        return 0 <= r && r <= 1;
    }

    private checkMinCoord(point: Vec2, minCoords: Vec2): Vec2 {
        if (point.x < minCoords.x) minCoords.x = point.x;
        if (point.y < minCoords.y) minCoords.y = point.y;
        return minCoords;
    }

    private checkMaxCoord(point: Vec2, maxCoords: Vec2): Vec2 {
        if (point.x > maxCoords.x) maxCoords.x = point.x;
        if (point.y > maxCoords.y) maxCoords.y = point.y;
        return maxCoords;
    }

    drawInvalidRetroaction(currentPoint: Vec2): void {
        this.isInvalidSegment = true;
        const image = new Image();
        const imageScale = 0.1;
        image.src = './assets/prohibition.png';
        this.drawingService.previewCtx.drawImage(
            image,
            currentPoint.x - (image.width * imageScale) / 2,
            currentPoint.y - (image.height * imageScale) / 2,
            image.width * imageScale,
            image.height * imageScale,
        );
    }

    private createSelection(): void {
        this.calculateSelectionRectangle();
        const shape = new LassoShape(this.createSelectionPathData());
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.makeImage(shape);
        this.drawingService.previewCtx.strokeStyle = this.drawingService.colorService.primaryColor.getRgb();
        this.lineService.endDrawing();
    }

    private checkFinalPosition(): Vec2 {
        const finalPosition = this.mathService.verifyPointProximity(
            this.lineService.pathData[0],
            this.lineService.pathData[this.lineService.pathData.length - 1],
        );
        this.lineService.pathData[this.lineService.pathData.length - 1] = finalPosition;

        return finalPosition;
    }

    private setContextStyle(): void {
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.setLineDash([DEFAULT_LINE_DASH, DEFAULT_LINE_DASH]);
    }

    endDrawing(): void {
        this.selectionService.endDrawing();
        this.lineService.endDrawing();
        this.lineService.shiftDown = false;
        this.selectionService.isSelected = false;
        this.selectionService.isBorderSelected = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.dimensions = { width: 0, height: 0 };
        this.drawingService.previewCtx.setLineDash([]);
        this.drawingService.previewCtx.strokeStyle = this.drawingService.colorService.primaryColor.getRgb();
    }
}
