import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_TOLERANCE, MIN_TOLERANCE } from '@app/classes/constants';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BucketService } from './bucket.service';

describe('BucketService', () => {
    let service: BucketService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let leftMouseEvent: MouseEvent;
    let rightMouseEvent: MouseEvent;

    // tslint:disable: no-any
    let setColorsSpy: jasmine.Spy<any>;
    let updateDimensionsSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);
        drawServiceSpy.colorService = new ColorService();
        drawServiceSpy.undoRedoService = new UndoRedoService();

        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(BucketService);
        // tslint:disable: no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['dimensions'] = { width: 250, height: 250 };

        setColorsSpy = spyOn<any>(service, 'setColors').and.callThrough();
        updateDimensionsSpy = spyOn<any>(service, 'updateDimensions').and.callThrough();
        spyOn<any>(drawServiceSpy.baseCtx, 'getImageData').and.returnValue(new ImageData(canvasStub.width, canvasStub.height));
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });

        leftMouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        rightMouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setting tolerance should be MIN if less than MIN', () => {
        const lesserTolerance = -1;
        service.bucketTolerance = lesserTolerance;
        expect(service.bucketTolerance).toBe(MIN_TOLERANCE);
    });

    it('setting tolerance should be MIN if less than MIN', () => {
        const lesserTolerance = -1;
        service.bucketTolerance = lesserTolerance;
        expect(service.bucketTolerance).toBe(MIN_TOLERANCE);
    });

    it('setting tolerance should be MAX if more than MAX', () => {
        const greaterTolerance = 200;
        service.bucketTolerance = greaterTolerance;
        expect(service.bucketTolerance).toBe(MAX_TOLERANCE);
    });

    it('onMouseDown shouldnt call setColors if mousebutton not left or right', () => {
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Forward,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(setColorsSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should call setColors and adjacentChange if mousebutton is left', () => {
        const adjacentChangeSpy = spyOn<any>(service, 'adjacentChange');
        service.onMouseDown(leftMouseEvent);
        expect(setColorsSpy).toHaveBeenCalled();
        expect(adjacentChangeSpy).toHaveBeenCalled();
        expect(updateDimensionsSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call nonAdjacentChange if mousebutton is right', () => {
        const nonAdjacentChangeSpy = spyOn<any>(service, 'nonAdjacentChange');
        service.onMouseDown(rightMouseEvent);
        expect(nonAdjacentChangeSpy).toHaveBeenCalled();
    });

    it('onMouseUp shouldnt change mouseDown if mouse isnt down', () => {
        service.mouseDown = false;
        service.onMouseUp(leftMouseEvent);
        expect(service.mouseDown).toBe(false);
    });

    it('onMouseUp should change mouseDown to false if mouse is down', () => {
        service.mouseDown = true;
        service.onMouseUp(leftMouseEvent);
        expect(service.mouseDown).toBe(false);
    });

    it('right mouse down should call buildNewData', () => {
        const buildNewDataSpy = spyOn<any>(service, 'buildNewData').and.callThrough();
        service.onMouseDown(rightMouseEvent);
        expect(buildNewDataSpy).toHaveBeenCalled();
    });

    it('left mouse event should call dfs', () => {
        const bfsSpy = spyOn<any>(service, 'dfs').and.callThrough();
        service.onMouseDown(leftMouseEvent);
        expect(bfsSpy).toHaveBeenCalled();
    });

    it('changePointColor should be called it points are the same color on left click', () => {
        spyOn<any>(service, 'isSameColor').and.returnValue(true);
        const changePointColorSpy = spyOn<any>(service, 'changePointColor').and.callThrough();
        service.onMouseDown(rightMouseEvent);
        expect(changePointColorSpy).toHaveBeenCalled();
    });

    it('changePointColor should not be called it points are not the same color on left click', () => {
        spyOn<any>(service, 'isSameColor').and.returnValue(false);
        const changePointColorSpy = spyOn<any>(service, 'changePointColor').and.callThrough();
        service.onMouseDown(rightMouseEvent);
        expect(changePointColorSpy).not.toHaveBeenCalled();
    });
});
