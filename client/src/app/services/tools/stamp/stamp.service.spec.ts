import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FIRST_ANGLE_MOUSE_WHEEL, MAX_ANGLE_DEGREE, MIN_SCALE, SCALE_FACTOR } from '@app/classes/constants';
import { MouseButton } from '@app/enums/mouse-buttons';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { StampService } from './stamp.service';

describe('StampService', () => {
    let service: StampService;
    let mouseEvent: MouseEvent;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StampService);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        drawingServiceSpy.undoRedoService = undoRedoSpy;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;

        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.baseCtx = baseCtxStub;
        drawingServiceSpy.previewCtx = previewCtxStub;
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        // tslint:disable: no-string-literal
        service['drawingService'] = drawingServiceSpy;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.stampVisualisation = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.mouseDownCoord = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should verify that it doesnt call the function it doesnt call left click', () => {
        const mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;

        service.onMouseDown(mouseEventRight);
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'addCommand');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call drawStamp on mouse down', () => {
        const spy = spyOn<any>(service, 'drawStamp').and.callThrough();
        service.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call draw when on mouse move', () => {
        const spy = spyOn<any>(service, 'draw');
        service.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should rotate when we change the mouse wheel direction', () => {
        const wheelEvent = {
            deltaY: 30,
        } as WheelEvent;
        const spy = spyOn<any>(service, 'draw');
        service.onMouseWheel(wheelEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should change the direction of the rotation wheel', () => {
        const wheelEvent = {
            deltaY: -30,
            altKey: true,
        } as WheelEvent;
        const spy = spyOn<any>(service, 'draw');
        service.onMouseWheel(wheelEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should test the case when we hit a negative angle', () => {
        const bigNumber = 383832;
        service.stampAngle = bigNumber;
        const wheelEvent = {
            deltaY: -30,
            altKey: true,
        } as WheelEvent;
        const spy = spyOn<any>(service, 'draw');
        service.onMouseWheel(wheelEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('setStampScale should set min value if less than min', () => {
        const smallValue = -5;
        service.stampScale = smallValue;
        expect(service.stampScale).toBe(MIN_SCALE * SCALE_FACTOR);
    });

    it('currentAngle should be FIRST_ANGLE_MOUSE_WHEEL if this.currentAngle > MAX_ANGLE_DEGREE', () => {
        const wheelEvent = {
            deltaY: 30,
            altKey: true,
        } as WheelEvent;
        service['currentAngle'] = MAX_ANGLE_DEGREE + 2;
        service.onMouseWheel(wheelEvent);
        expect(service['currentAngle']).toBe(FIRST_ANGLE_MOUSE_WHEEL);
    });
});
