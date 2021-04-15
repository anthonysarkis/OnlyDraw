import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { ResizeCommand } from '@app/classes/commands/resize-command';
import { MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH, SELECTION_ANCHOR_SIZE } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Anchor } from '@app/enums/drag-anchors';
import { Dimensions } from '@app/interfaces/dimensions';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class CanvasOperationsService {
    defaultDimensions: Dimensions;
    previewDimensions: Dimensions;
    canvasDimensions: Dimensions;
    anchors: Vec2[];

    constructor(protected undoRedoService: UndoRedoService, public imageService: ImageHelperService) {
        this.defaultDimensions = { width: 0, height: 0 };
        this.previewDimensions = { width: 0, height: 0 };
        this.canvasDimensions = { width: 0, height: 0 };
        this.anchors = new Array(SELECTION_ANCHOR_SIZE).fill({ x: 0, y: 0 });
        this.updateAnchorPositions(this.previewDimensions, 0);
    }

    setDefaultDimensions(): void {
        this.updateCanvasDimensions(this.defaultDimensions.width, this.defaultDimensions.height);
    }

    updateCanvasDimensions(newWidth: number, newHeight: number): void {
        this.previewDimensions = { width: newWidth, height: newHeight };
        this.updateCanvasAnchors(this.previewDimensions, 0);
    }

    updateCanvasAnchors(dimensions: Dimensions, offset: number): void {
        this.canvasDimensionsValidation();
        this.anchors = this.updateAnchorPositions(dimensions, offset);
        this.canvasDimensions.width = dimensions.width;
        this.canvasDimensions.height = dimensions.height;
    }

    private updatePreviewDimensions(event: CdkDrag, isYAxis: boolean, isXAxis: boolean): void {
        if (isYAxis) {
            this.previewDimensions.height =
                this.canvasDimensions.height - (this.anchors[Anchor.BottomMiddleAnchor].y - event.getFreeDragPosition().y);
        }
        if (isXAxis) {
            this.previewDimensions.width = this.canvasDimensions.width - (this.anchors[Anchor.RightMiddleAnchor].x - event.getFreeDragPosition().x);
        }
    }

    dragMove(event: CdkDragMove, isYAxis: boolean, isXAxis: boolean): void {
        this.updatePreviewDimensions(event.source, isYAxis, isXAxis);
    }

    dragEnd(event: CdkDragEnd, isYAxis: boolean, isXAxis: boolean): void {
        this.updatePreviewDimensions(event.source, isYAxis, isXAxis);
        this.addCommand();
        this.updateCanvasAnchors(this.previewDimensions, 0);
    }

    private canvasDimensionsValidation(): void {
        if (this.previewDimensions.width < MIN_CANVAS_WIDTH) {
            this.previewDimensions.width = MIN_CANVAS_WIDTH;
        }
        if (this.previewDimensions.height < MIN_CANVAS_HEIGHT) {
            this.previewDimensions.height = MIN_CANVAS_HEIGHT;
        }
    }

    private updateAnchorPositions(dimensions: Dimensions, offset: number): Vec2[] {
        const anchors: Vec2[] = new Array(SELECTION_ANCHOR_SIZE).fill({ x: 0, y: 0 });
        anchors[Anchor.TopLeftAnchor] = { x: 0 - offset, y: -offset };
        anchors[Anchor.TopMiddleAnchor] = { x: dimensions.width / 2 - offset, y: -offset - 2 };
        anchors[Anchor.TopRightAnchor] = { x: dimensions.width - offset, y: -offset };
        anchors[Anchor.RightMiddleAnchor] = { x: dimensions.width - offset, y: dimensions.height / 2 - offset };
        anchors[Anchor.BottomRightAnchor] = { x: dimensions.width - offset, y: dimensions.height - offset };
        anchors[Anchor.BottomMiddleAnchor] = { x: dimensions.width / 2 - offset, y: dimensions.height - offset };
        anchors[Anchor.BottomLeftAnchor] = { x: -offset, y: dimensions.height - offset };
        anchors[Anchor.LeftMiddleAnchor] = { x: -offset - 2, y: dimensions.height / 2 - offset };
        return anchors;
    }

    addCommand(): void {
        this.canvasDimensionsValidation();
        const command = new ResizeCommand(this, { width: this.previewDimensions.width, height: this.previewDimensions.height });
        this.undoRedoService.addCommand(command);
    }
}
