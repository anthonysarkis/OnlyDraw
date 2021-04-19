import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DRAWING_DELAY, HALF_SECOND, LOADING_DELAY, NUMBER_OF_IMAGES_DISPLAYED, TWO_SECONDS } from '@app/classes/constants';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Image } from '@common/communication/image';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    currentIndexes: number[];
    images: Image[];
    filterTags: string[];
    errorMessage: string;
    showSpinner: boolean;
    showErrorMessage: boolean;
    showConfirmationMsg: boolean;

    constructor(
        private communicationService: CommunicationService,
        private drawingService: DrawingService,
        private canvasService: CanvasOperationsService,
        private snackBar: MatSnackBar,
    ) {
        this.images = [];
        this.filterTags = [];
        this.currentIndexes = [0, 1, 2];
        this.showSpinner = true;
        this.showErrorMessage = false;
        this.showConfirmationMsg = false;
        this.errorMessage = '';
    }

    getAllImages(): void {
        this.showSpinner = true;
        this.communicationService
            .getAllImages()
            .pipe(
                map((filteredImages: Image[]) => {
                    return this.addBase64ToImages(filteredImages);
                }),
            )
            .subscribe(
                (filteredImages: Image[]) => {
                    this.setImages(filteredImages, TWO_SECONDS);
                },
                (error: string) => {
                    this.setError(error);
                },
            );
    }

    getImagesByTag(): void {
        this.showSpinner = true;
        this.communicationService
            .getImagesByTag(this.filterTags)
            .pipe(
                map((filteredImages: Image[]) => {
                    return this.addBase64ToImages(filteredImages);
                }),
            )
            .subscribe(
                (filteredImages: Image[]) => {
                    this.setImages(filteredImages, HALF_SECOND);
                },
                (error: string) => {
                    this.setError(error);
                },
            );
    }

    async onLoadImage(index: number): Promise<boolean> {
        this.showConfirmationMsg = false;
        this.showSpinner = true;

        return new Promise((resolve) => {
            this.communicationService
                .getImage(this.images[index]._id as string)
                .pipe(
                    map((receivedImage: Image) => {
                        return this.addBase64ToImage(receivedImage);
                    }),
                )
                .subscribe(
                    (receivedImage: Image) => {
                        this.loadImage(receivedImage);
                        resolve(true);
                    },
                    (error: string) => {
                        this.setError(error);
                        resolve(false);
                    },
                );
        });
    }

    onDeleteImage(index: number): void {
        this.communicationService.deleteImage(this.images[index]._id as string).subscribe(
            () => {
                this.deleteImage(index);
            },
            (error: string) => {
                this.setError(error);
            },
        );
    }

    confirmLoading(): boolean {
        if (!this.drawingService.checkIfSavedCanvas()) return true;
        this.showConfirmationMsg = true;
        return false;
    }

    private loadImage(image: Image): void {
        const imageToDraw = new Image();
        imageToDraw.src = image.encoding as string;
        this.showSpinner = false;

        setTimeout(() => {
            this.loadDrawing(imageToDraw);
        }, DRAWING_DELAY);
    }

    private addBase64ToImages(filteredImages: Image[]): Image[] {
        for (let image of filteredImages) {
            image = this.addBase64ToImage(image);
        }
        return filteredImages;
    }

    private addBase64ToImage(image: Image): Image {
        image.encoding = 'data:image/png;base64,' + image.encoding;
        return image;
    }

    private setImages(filteredImages: Image[], delay: number): void {
        this.images = filteredImages;
        this.currentIndexes = [0, 1, 2];
        setTimeout(() => {
            this.showSpinner = false;
        }, delay);
    }

    private setError(error: string): void {
        this.errorMessage = error;
        this.showSpinner = false;
        this.showErrorMessage = true;
    }

    private loadDrawing(image: HTMLImageElement): void {
        this.canvasService.updateCanvasDimensions(image.width, image.height);
        setTimeout(() => {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.drawCanvas(image);
            this.drawingService.canvasImage.src = this.drawingService.canvas.toDataURL();
            setTimeout(() => {
                this.drawingService.undoRedoService.clearHistory();
                this.drawingService.saveCanvas();
                this.drawingService.addCommand(this.drawingService.canvasImage);
            }, DRAWING_DELAY);
        }, LOADING_DELAY);
    }

    private deleteImage(index: number): void {
        const deletedImage = this.images.splice(index, 1);
        this.updateCurrentIndexes(index);
        this.showSnackbar(deletedImage[0]);
    }

    private showSnackbar(deletedImage: Image): void {
        this.snackBar.open(`${deletedImage.name} a été effacé avec succès`, 'Ok', {
            duration: TWO_SECONDS,
        });
    }

    private updateCurrentIndexes(index: number): void {
        if (this.images.length === 0) return;
        if (index >= this.images.length - 2 && this.images.length > 2) {
            this.currentIndexes[0] = this.images.length - this.currentIndexes.length;
            this.currentIndexes[1] = this.images.length - 2;
            this.currentIndexes[2] = this.images.length - 1;
        }
    }

    resetCarousel(): void {
        this.filterTags = [];
        this.currentIndexes = [0, 1, 2];
        this.errorMessage = '';
        this.showErrorMessage = false;
        this.showSpinner = false;
    }

    onPreviousClick(): void {
        if (this.images.length <= NUMBER_OF_IMAGES_DISPLAYED) return;
        let prevIndex = this.currentIndexes[0] - 1;
        prevIndex = prevIndex < 0 ? this.images.length - 1 : prevIndex;
        this.currentIndexes.unshift(prevIndex);
        this.currentIndexes.pop();
    }

    onNextClick(): void {
        if (this.images.length <= NUMBER_OF_IMAGES_DISPLAYED) return;
        const nextIndex = (this.currentIndexes[2] + 1) % this.images.length;
        this.currentIndexes.push(nextIndex);
        this.currentIndexes.shift();
    }
}
