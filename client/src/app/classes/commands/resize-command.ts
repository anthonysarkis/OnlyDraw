import { RESIZE_DELAY } from '@app/classes/constants';
import { Dimensions } from '@app/interfaces/dimensions';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { Command } from './command';

export class ResizeCommand implements Command {
    private savedDimensions: Dimensions;
    private canvasImage: HTMLImageElement;

    constructor(protected canvasOperations: CanvasOperationsService, protected currentDimensions: Dimensions) {
        this.savedDimensions = { width: this.canvasOperations.canvasDimensions.width, height: this.canvasOperations.canvasDimensions.height };
        this.canvasImage = this.canvasOperations.imageService.getSelectedImage({ x: 0, y: 0 }, this.currentDimensions);
    }

    async execute(): Promise<void> {
        this.canvasOperations.imageService.drawingService.clearCanvas(this.canvasOperations.imageService.drawingService.baseCtx);
        this.canvasOperations.imageService.drawingService.fillCanvasWhite(this.currentDimensions.width, this.currentDimensions.height);
        await this.loadImage(this.canvasImage);
    }

    saveState(): void {
        this.savedDimensions = { width: this.canvasOperations.canvasDimensions.width, height: this.canvasOperations.canvasDimensions.height };
    }

    restoreState(): void {
        this.canvasOperations.updateCanvasDimensions(this.savedDimensions.width, this.savedDimensions.height);
    }

    saveCanvas(): void {
        this.canvasOperations.imageService.drawingService.saveCanvas();
    }

    assignState(): void {
        this.canvasOperations.updateCanvasDimensions(this.currentDimensions.width, this.currentDimensions.height);
    }

    async loadImage(image: HTMLImageElement): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.canvasOperations.imageService.drawingService.baseCtx.drawImage(image, 0, 0);
                resolve();
            }, RESIZE_DELAY);
        });
    }
}
