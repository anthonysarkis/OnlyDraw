import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { MouseButton } from '@app/enums/mouse-buttons';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil-service';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let traceLineSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);

        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        traceLineSpy = spyOn<any>(service, 'traceLine').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['mainCtx'] = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseUp should call clearPath if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        const spy = spyOn(service, 'addCommand');

        service.onMouseUp(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call traceLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(traceLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' setting thickness should be MAX if its superior to MAX thickness', () => {
        const biggerThickness = 2000;
        service.thickness = biggerThickness;
        expect(service['tracerThickness']).toEqual(MAX_LINE_THICKNESS);
    });

    it(' setting thickness should be MIN if its inferior to MIN thickness', () => {
        const smallerThickness = 0.1;
        service.thickness = smallerThickness;
        expect(service['tracerThickness']).toEqual(MIN_LINE_THICKNESS);
    });

    it(' setting thickness should change baseCtx lineWidth', () => {
        const expectedThickness = 10;
        service.thickness = expectedThickness;
        expect(baseCtxStub.lineWidth).toBe(expectedThickness);
    });

    it(' onMouseMove should not call traceLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(traceLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call traceLine if mouse was already down and in canvas', () => {
        service.mouseDown = true;

        service['drawingService'].canvas = canvasStub;
        const canvasSize = 200;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;

        service.onMouseMove(mouseEvent);
        expect(traceLineSpy).toHaveBeenCalled();
    });

    it(' should change the pixel of the canvas ', () => {
        const spy = spyOn(service, 'addCommand');
        mouseEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseUp(mouseEvent);

        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
        expect(spy).toHaveBeenCalled();
    });
});
