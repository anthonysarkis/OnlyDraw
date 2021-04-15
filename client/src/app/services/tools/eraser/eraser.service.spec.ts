import { TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_ERASER_THICKNESS, MAX_RGB, MIN_ERASER_THICKNESS } from '@app/classes/constants';
import { ColorData } from '@app/enums/color-data';
import { MouseButton } from '@app/enums/mouse-buttons';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

// tslint:disable:no-any
describe('EraserService', () => {
    let service: EraserService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let traceLineSpy: jasmine.Spy<any>;
    let spyPreviewCtxRect: jasmine.Spy<any>;
    let spyInterpolate: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);

        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        spyPreviewCtxRect = spyOn(previewCtxStub, 'rect').and.callThrough();

        service = TestBed.inject(EraserService);
        traceLineSpy = spyOn<any>(service, 'traceLine').and.callThrough();
        spyInterpolate = spyOn<any>(service, 'interpolatePoints').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initialize properties should set main context to base context', () => {
        service.initializeProperties();
        expect(service['mainCtx']).toEqual(service['drawingService'].baseCtx);
    });

    it(' onMouseUp should call clearPath if mouse was already down', () => {
        service['mainCtx'] = baseCtxStub;
        const spy = spyOn(service, 'addCommand');
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call traceLine if mouse was not already down', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(traceLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        service['mainCtx'] = baseCtxStub;
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' setting thickness should be MAX if its superior to MAX thickness', () => {
        service['mainCtx'] = baseCtxStub;
        const biggerThickness = 2000;
        service.thickness = biggerThickness;
        expect(service['tracerThickness']).toEqual(MAX_ERASER_THICKNESS);
    });

    it(' setting thickness should be MIN if its inferior to MIN thickness', () => {
        service['mainCtx'] = baseCtxStub;
        const smallerThickness = 1;
        service.thickness = smallerThickness;
        expect(service['tracerThickness']).toEqual(MIN_ERASER_THICKNESS);
    });

    it(' onMouseLeave should call clearCanvas on the preview context', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseLeave(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' onMouseMove should call traceLine if mouse was already down', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(traceLineSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove shouldnt call traceLine if mouse isnt already down', () => {
        service['mainCtx'] = baseCtxStub;
        service.onMouseMove(mouseEvent);
        expect(traceLineSpy).not.toHaveBeenCalled();
    });

    it(' ctx.rect should be called with correct coordinates on preview context', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        const eraserThickness = 10;
        service.thickness = eraserThickness;
        const expectedCenterCoords = { x: 20, y: 20 };

        service.onMouseMove(mouseEvent);
        expect(spyPreviewCtxRect).toHaveBeenCalledWith(expectedCenterCoords.x, expectedCenterCoords.y, service.thickness, service.thickness);
    });

    it(' preview context should have the same properties before and after white square is drawn', () => {
        service['mainCtx'] = baseCtxStub;
        const eraserThickness = 10;
        service.mouseDown = true;
        service.thickness = eraserThickness;

        const expectedFillStyle = '#ffff00';
        const expectedStrokeStyle = '#008000';
        const expectedLineWidth = 10;
        previewCtxStub.fillStyle = expectedFillStyle;
        previewCtxStub.strokeStyle = expectedStrokeStyle;
        previewCtxStub.lineWidth = expectedLineWidth;

        service.onMouseMove(mouseEvent);

        expect(previewCtxStub.fillStyle).toEqual(expectedFillStyle);
        expect(previewCtxStub.strokeStyle).toEqual(expectedStrokeStyle);
        expect(previewCtxStub.lineWidth).toEqual(expectedLineWidth);
    });

    it(' call to traceLine should erase pixel of the canvas ', () => {
        service['mainCtx'] = baseCtxStub;
        const spy = spyOn(service, 'addCommand');
        // draw black dot on pixel 0,0
        baseCtxStub.strokeStyle = 'black';
        baseCtxStub.beginPath();
        baseCtxStub.lineTo(0, 0);
        baseCtxStub.closePath();

        mouseEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseUp(mouseEvent);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[ColorData.Red]).toEqual(MAX_RGB);
        expect(imageData.data[ColorData.Green]).toEqual(MAX_RGB);
        expect(imageData.data[ColorData.Blue]).toEqual(MAX_RGB);
        expect(imageData.data[ColorData.Alpha]).toEqual(MAX_RGB);
        expect(spy).toHaveBeenCalled();
    });

    it(' interpolatePoints shouldnt be called if path data length is 0 or 1', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        expect(service['pathData'].length).toBe(0);
        service.onMouseMove(mouseEvent);
        expect(service['pathData'].length).toBe(1);
        expect(spyInterpolate).not.toHaveBeenCalled();
    });

    it(' interpolatePoints should be called if pathData contains at least 2 mouse positions ', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        // Two onMouseMoves add at least 2 mouse positions
        service.onMouseMove(mouseEvent);
        service.onMouseMove(mouseEvent);
        expect(spyInterpolate).toHaveBeenCalled();
    });

    it(' interpolate points should add points in pathData if at least two far consecutive points in pathData', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 20, y: 20 },
        ];
        expect(service['pathData'].length).toBe(2);
        service.onMouseMove(mouseEvent);
        expect(service['pathData'].length).toBeGreaterThan(2);
    });

    it(' interpolate points should only change y value if x value of two consecutive points are the same', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        service['pathData'] = [{ x: 25, y: 15 }];
        service.onMouseMove(mouseEvent);
        const pathDataLength = service['pathData'].length;
        const expectedX = 25;
        const expectedY1 = 15;
        const expectedY2 = 24;
        expect(service['pathData'][0].x).toBe(expectedX);
        expect(service['pathData'][pathDataLength - 1].x).toBe(expectedX);
        expect(service['pathData'][0].y).toBe(expectedY1);
        expect(service['pathData'][pathDataLength - 1].y).toBe(expectedY2);
    });

    it(' interpolate points should only change x value if y value of two consecutive points are the same', () => {
        service['mainCtx'] = baseCtxStub;
        service.mouseDown = true;
        service['pathData'] = [{ x: 15, y: 25 }];
        service.onMouseMove(mouseEvent);
        const pathDataLength = service['pathData'].length;
        const expectedY = 25;
        const expectedX1 = 15;
        const expectedX2 = 24;
        expect(service['pathData'][0].x).toBe(expectedX1);
        expect(service['pathData'][pathDataLength - 1].x).toBe(expectedX2);
        expect(service['pathData'][0].y).toBe(expectedY);
        expect(service['pathData'][pathDataLength - 1].y).toBe(expectedY);
    });
});
