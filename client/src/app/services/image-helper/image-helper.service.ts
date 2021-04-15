import { Injectable } from '@angular/core';
import { DEFAULT_LINE_DASH, DEFAULT_LINE_THICKNESS, FILL_COLOR, SELECTION_ZONE_COLOR } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';
import { Shape } from '@app/interfaces/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ImageHelperService {
    constructor(public drawingService: DrawingService) {}

    getSelectedImage(position: Vec2, dimensions?: Dimensions): HTMLImageElement {
        let imageDimensions = { width: this.drawingService.canvas.width, height: this.drawingService.canvas.height };
        if (dimensions) imageDimensions = { width: dimensions.width, height: dimensions.height };

        const image = this.drawingService.baseCtx.getImageData(position.x, position.y, imageDimensions.width, imageDimensions.height);
        const imageElement = new Image();
        imageElement.src = this.getImageURL(image, imageDimensions);
        imageElement.width = imageDimensions.width;
        imageElement.height = imageDimensions.height;
        return imageElement;
    }

    private getImageURL(image: ImageData, dimensions: Dimensions): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.putImageData(image, 0, 0);
        return canvas.toDataURL();
    }

    getClippedImage(image: HTMLImageElement, shape: Shape, dimensions: Dimensions): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.fillStyle = FILL_COLOR;
        shape.drawFill(ctx, { x: 0, y: 0 });
        ctx.clip();
        ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
        image.src = canvas.toDataURL();
        ctx.setLineDash([DEFAULT_LINE_DASH, DEFAULT_LINE_DASH]);
        ctx.lineWidth = DEFAULT_LINE_THICKNESS;
        ctx.strokeStyle = SELECTION_ZONE_COLOR;
        shape.drawBorder(ctx, { x: 0, y: 0 });
        return canvas.toDataURL();
    }

    drawOnBaseCtx(image: HTMLImageElement, corner: Vec2, dimensions: Dimensions): void {
        this.drawingService.baseCtx.drawImage(image, corner.x, corner.y, dimensions.width, dimensions.height);
    }
}
