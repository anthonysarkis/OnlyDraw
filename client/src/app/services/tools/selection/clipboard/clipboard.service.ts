import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';
import { Shape } from '@app/interfaces/shape';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    image: HTMLImageElement;
    imageDimensions: Dimensions;
    initialCoord: Vec2;
    shape: Shape;

    constructor(public selectionService: SelectionService) {
        this.imageDimensions = { width: 0, height: 0 };
        this.initialCoord = { x: 0, y: 0 };
    }

    copy(): void {
        if (!this.selectionService.isSelected) return;
        this.getSelection();
    }

    paste(): void {
        if (!this.image) return;
        if (this.selectionService.isSelected) this.selectionService.endDrawing();
        this.shape.width = Math.abs(this.imageDimensions.width);
        this.shape.height = Math.abs(this.imageDimensions.height);
        this.selectionService.ctx.resetTransform();
        const imageCopy = new Image(this.imageDimensions.width, this.imageDimensions.height);
        imageCopy.src = this.image.src;
        setTimeout(() => {
            this.selectionService.initializeSelection(this.imageDimensions, this.initialCoord, this.initialCoord);
            this.selectionService.initializeImage(imageCopy, this.shape, true);
        });
    }

    cut(): void {
        if (!this.selectionService.isSelected) return;
        this.copy();
        this.delete();
    }

    delete(): void {
        if (!this.selectionService.isSelected) return;
        this.selectionService.isSelected = false;
        this.selectionService.mouseDown = false;
        this.selectionService.selectedImage = new Image(
            this.selectionService.currentDimensions.width,
            this.selectionService.currentDimensions.height,
        );
        this.selectionService.xTransformation = false;
        this.selectionService.yTransformation = false;
        this.selectionService.addCommand();
        this.selectionService.drawingService.saveCanvas();
    }

    private getSelection(): void {
        this.getImage();
        this.getShape();
    }

    private getImage(): void {
        this.image = new Image(this.selectionService.currentDimensions.width, this.selectionService.currentDimensions.height);
        this.selectionService.getFullCanvasImage(this.image);
        this.imageDimensions.width = this.selectionService.currentDimensions.width;
        this.imageDimensions.height = this.selectionService.currentDimensions.height;
    }

    private getShape(): void {
        this.shape = this.selectionService.shape;
        this.shape.width = Math.abs(this.selectionService.shape.width as number);
        this.shape.height = Math.abs(this.selectionService.shape.height as number);
    }
}
