import { Injectable, OnDestroy } from '@angular/core';
import { DrawingCommand } from '@app/classes/commands/drawing-command';
import { CANVAS_NAME } from '@app/classes/constants';
import { DrawingState } from '@app/classes/state/drawing-state';
import { ColorService } from '@app/services/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService implements OnDestroy {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    private colorSubscription: Subscription;

    confirmationDialog: Subject<boolean>;
    exportDialog: Subject<boolean>;
    saveDialog: Subject<boolean>;
    carouselDialog: Subject<boolean>;
    canvasName: string;
    canvasImage: HTMLImageElement;

    constructor(public colorService: ColorService, public undoRedoService: UndoRedoService) {
        this.canvasName = CANVAS_NAME;
        this.confirmationDialog = new Subject();
        this.exportDialog = new Subject();
        this.saveDialog = new Subject();
        this.carouselDialog = new Subject();
        this.canvasImage = new Image();
    }

    initializeColor(): void {
        this.colorSubscription = this.colorService.colorChanged.subscribe(() => {
            this.baseCtx.strokeStyle = this.colorService.primaryColor.getRgb();
            this.previewCtx.strokeStyle = this.colorService.primaryColor.getRgb();
            this.baseCtx.fillStyle = this.colorService.secondaryColor.getRgb();
            this.previewCtx.fillStyle = this.colorService.secondaryColor.getRgb();
        });
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    newCanvas(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.undoRedoService.clearHistory();
        this.fillCanvasWhite(this.canvas.width, this.canvas.height);
    }

    fillCanvasWhite(width: number, height: number): void {
        this.baseCtx.save();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, width, height);
        this.baseCtx.restore();
    }

    resetCanvas(): void {
        if (this.checkIfSavedCanvas()) this.openConfirmationDialog();
    }

    checkIfSavedCanvas(): boolean {
        return localStorage.hasOwnProperty(CANVAS_NAME);
    }

    clearSavedCanvas(): void {
        localStorage.clear();
    }

    saveCanvas(): void {
        localStorage.setItem(this.canvasName, this.canvas.toDataURL());
        localStorage.setItem('height', this.canvas.height.toString());
        localStorage.setItem('width', this.canvas.width.toString());
    }

    loadCanvas(): void {
        this.canvasImage.onload = () => {
            this.drawCanvas(this.canvasImage);
            this.addCommand(this.canvasImage);
            this.initializeColor();
        };
        this.canvas.width = parseInt(localStorage.getItem('width') as string, 10);
        this.canvas.height = parseInt(localStorage.getItem('height') as string, 10);
        this.canvasImage.src = localStorage.getItem(this.canvasName) as string;
    }

    drawCanvas(canvas: HTMLImageElement): void {
        this.baseCtx.drawImage(canvas, 0, 0);
    }

    openConfirmationDialog(): void {
        this.confirmationDialog.next(true);
    }

    openExportDialog(): void {
        this.exportDialog.next(true);
    }

    openSaveDialog(): void {
        this.saveDialog.next(true);
    }

    openCarouselDialog(): void {
        this.carouselDialog.next(true);
    }

    addCommand(canvasImage: HTMLImageElement): void {
        const currentState = new DrawingState(1, this.colorService.primaryColor, this.colorService.secondaryColor, canvasImage);
        const command = new DrawingCommand(this, currentState, this.colorService);
        this.undoRedoService.minHistorySize += 1;
        this.undoRedoService.addCommand(command);
    }

    ngOnDestroy(): void {
        this.colorSubscription.unsubscribe();
    }
}
