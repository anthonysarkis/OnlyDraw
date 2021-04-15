import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CANVAS_NAME } from '@app/classes/constants';
import { ColorService } from '@app/services/color/color.service';
import { Subscription } from 'rxjs';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let colorService: ColorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(DrawingService);
        colorService = TestBed.inject(ColorService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('clearCanvas should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should open the export Dialog', () => {
        service.openExportDialog();
        service.exportDialog.subscribe(() => {
            expect(service.confirmationDialog).toBeTrue();
        });
        expect(service).toBeTruthy();
    });

    it('should open the save Dialog', () => {
        service.openSaveDialog();
        service.saveDialog.subscribe(() => {
            expect(service.confirmationDialog).toBeTrue();
        });
        expect(service).toBeTruthy();
    });

    it('should open the carousel Dialog', () => {
        service.openCarouselDialog();
        service.carouselDialog.subscribe(() => {
            expect(service.confirmationDialog).toBeTrue();
        });
        expect(service).toBeTruthy();
    });

    it('should open the Confirmation Dialog', () => {
        service.openConfirmationDialog();
        service.confirmationDialog.subscribe(() => {
            expect(service.confirmationDialog).toBeTrue();
        });
        expect(service).toBeTruthy();
    });

    it('initialize color should set the correct colors', () => {
        service.initializeColor();
        colorService.colorChanged.next(true);
        const hexEndIndex = 7;
        expect(service.baseCtx.strokeStyle).toEqual(colorService.primaryColor.hex.slice(0, hexEndIndex));
        expect(service.previewCtx.strokeStyle).toEqual(colorService.primaryColor.hex.slice(0, hexEndIndex));
        expect(service.baseCtx.fillStyle).toEqual(colorService.secondaryColor.hex.slice(0, hexEndIndex));
        expect(service.previewCtx.fillStyle).toEqual(colorService.secondaryColor.hex.slice(0, hexEndIndex));
    });

    it('resetCanvas should not open dialog if canvas is empty', () => {
        const nextSpy = spyOn(service.confirmationDialog, 'next');
        service.clearCanvas(service.baseCtx);
        service.clearSavedCanvas();
        service.resetCanvas();
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('resetCanvas should open dialog if canvas is not empty', () => {
        const nextSpy = spyOn(service.confirmationDialog, 'next');
        const position = 10;
        service.baseCtx.beginPath();
        service.baseCtx.moveTo(0, 0);
        service.baseCtx.lineTo(position, position);
        service.baseCtx.stroke();
        service.baseCtx.closePath();
        service.saveCanvas();
        service.resetCanvas();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('saveCanvas should setItem in localStorage', () => {
        service.saveCanvas();
        expect(localStorage.key(0)).toBe('height');
        expect(localStorage.key(1)).toBe('width');
        expect(localStorage.key(2)).toBe(CANVAS_NAME);
    });

    it('ngOnDestroy should unsubscribe from colorSubscription', () => {
        // tslint:disable: no-string-literal
        service['colorSubscription'] = new Subscription();
        spyOn(service['colorSubscription'], 'unsubscribe');
        service.ngOnDestroy();
        expect(service['colorSubscription'].unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('loadCanvas should get the image from localStorage', () => {
        // tslint:disable: no-any
        const getItemSpy = spyOn<any>(window.localStorage, 'getItem');
        const drawImageSpy = spyOn<any>(service['baseCtx'], 'drawImage');
        service.loadCanvas();
        expect(drawImageSpy).not.toHaveBeenCalled();
        expect(getItemSpy).toHaveBeenCalled();
    });

    it('loadCanvas should draw image', () => {
        const drawImageSpy = spyOn<any>(service['baseCtx'], 'drawImage');
        const getItemSpy = spyOn<any>(window.localStorage, 'getItem').and.callFake(() => {
            return new Image();
        });
        service.loadCanvas();
        expect(getItemSpy).toHaveBeenCalled();
        expect(drawImageSpy).not.toHaveBeenCalled();
    });

    it('new canvas should have base ctx et preview context cleared', () => {
        const clearSpy = spyOn<any>(service, 'clearCanvas');
        service.newCanvas();
        expect(clearSpy).toHaveBeenCalledWith(service.baseCtx);
        expect(clearSpy).toHaveBeenCalledWith(service.previewCtx);
    });

    it('add command should add command in undo redo service ', () => {
        const undoSpy = spyOn<any>(service.undoRedoService, 'addCommand');
        service.addCommand(service.canvasImage);
        expect(undoSpy).toHaveBeenCalled();
    });

    it('draw canvas should draw image on canvas ', () => {
        const drawImageSpy = spyOn<any>(service.baseCtx, 'drawImage');
        service.drawCanvas(service.canvasImage);
        expect(drawImageSpy).toHaveBeenCalled();
    });
});
