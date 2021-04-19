import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import {
    DIAMETER_POINT_SIZE_RATIO,
    MAX_AEROSOL_DIAMETER,
    MAX_AEROSOL_EMISSIONS,
    MIN_AEROSOL_DIAMETER,
    MIN_AEROSOL_EMISSIONS,
    MIN_AEROSOL_POINT_SIZE,
} from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { MathService } from '@app/services/math/math.service';
import { AerosolService } from './aerosol.service';

describe('AerosolService', () => {
    let service: AerosolService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    const canvasSize = 250;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let offscreenContextStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;

    // tslint:disable: no-any
    let startSpraySpy: jasmine.Spy<any>;
    let endSpraySpy: jasmine.Spy<any>;
    let mathServiceStub: MathService;

    beforeEach(() => {
        mathServiceStub = new MathService();

        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            providers: [{ provide: MathService, useValue: mathServiceStub }],
        });
        service = TestBed.inject(AerosolService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        offscreenContextStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable: no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;
        service['drawingService'].canvas = canvasStub;
        service['offscreenCanvas'] = canvasStub;
        endSpraySpy = spyOn<any>(service, 'endSpray').and.callThrough();

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should call startSpray if pressed with left button and in canvas', () => {
        spyOn<any>(service, 'isPointInCanvas').and.returnValue(true);
        startSpraySpy = spyOn<any>(service, 'startSpray').and.callThrough();
        service['offscreenContext'] = offscreenContextStub;

        service.onMouseDown(mouseEvent);
        expect(startSpraySpy).toHaveBeenCalled();
    });

    it('onMouseDown should not startSpray if pressed with right button', () => {
        spyOn<any>(service['drawingService'].canvas, 'toDataURL').and.callFake(() => {
            return;
        });
        startSpraySpy = spyOn<any>(service, 'startSpray').and.callThrough();
        service['offscreenContext'] = offscreenContextStub;

        const newMouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;

        service.onMouseDown(newMouseEvent);
        expect(startSpraySpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call endSpray if mouse is already down', () => {
        spyOn<any>(service['drawingService'].canvas, 'toDataURL').and.callFake(() => {
            return;
        });

        service['offscreenContext'] = offscreenContextStub;
        service.mouseDown = true;
        service.onMouseUp();
        expect(endSpraySpy).toHaveBeenCalled();
    });

    it('onMouseUp should not call endSpray if mouse is not already down', () => {
        service.mouseDown = false;
        service['offscreenContext'] = offscreenContextStub;
        service.onMouseUp();
        expect(endSpraySpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should set correct value to mousePosition', () => {
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        service['offscreenContext'] = offscreenContextStub;
        service.onMouseMove(mouseEvent);
        expect(service['mousePosition']).toEqual({ x: 1, y: 1 });
    });

    it('endDrawing should call endSpray', () => {
        service['offscreenContext'] = offscreenContextStub;
        service.endDrawing();
        expect(endSpraySpy).toHaveBeenCalled();
    });

    it('onMouseDown should not call isPointInCanvas if mousePosition inferior to 0', () => {
        const newMouseEvent = {
            offsetX: 25,
            offsetY: -5,
            button: MouseButton.Left,
        } as MouseEvent;

        const mousePosition = { x: -5, y: 10 };
        service['offscreenContext'] = offscreenContextStub;
        const spyM = spyOn<any>(service, 'isPointInCanvas').and.callThrough().withArgs(mousePosition);
        service.onMouseDown(newMouseEvent);
        expect(spyM.and.callThrough()).toHaveBeenCalled();
    });

    it('onMouseDown should not call isPointInCanvas if mousePosition superior to canvas size', () => {
        const newMouseEvent = {
            offsetX: 500,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        const mousePosition = { x: 500, y: 25 };
        service['offscreenContext'] = offscreenContextStub;
        const spyM = spyOn<any>(service, 'isPointInCanvas').and.callThrough().withArgs(mousePosition);
        service.onMouseDown(newMouseEvent);
        expect(spyM.and.callThrough()).toHaveBeenCalled();
    });

    it('emissions shoult be min value if less than min', () => {
        const newMin = 0;
        service.emissions = newMin;
        service['offscreenContext'] = offscreenContextStub;
        expect(service.emissions).toBe(MIN_AEROSOL_EMISSIONS);
    });

    it('emissions shoult be max value if more than max', () => {
        const bigger = 5000;
        service.emissions = bigger;
        service['offscreenContext'] = offscreenContextStub;
        expect(service.emissions).toBe(MAX_AEROSOL_EMISSIONS);
    });

    it('emissions should be entered value if good value', () => {
        const emissionsValue = 50;
        service.emissions = emissionsValue;
        service['offscreenContext'] = offscreenContextStub;
        expect(service.emissions).toBe(emissionsValue);
    });

    it('point size shoult be min value if less than min', () => {
        const newMin = 0;
        service.pointSize = newMin;
        service['offscreenContext'] = offscreenContextStub;
        expect(service.pointSize).toBe(MIN_AEROSOL_POINT_SIZE);
    });

    it('point size shoult be tenth diameter value if more than tenth diameter', () => {
        const bigger = 5000;
        const tenthDiameter = Math.ceil(service.diameter / DIAMETER_POINT_SIZE_RATIO);
        service.pointSize = bigger;
        expect(service.pointSize).toBe(tenthDiameter);
    });

    it('point should be entered value if good value', () => {
        const diameterValue = 30;
        service.diameter = diameterValue;
        const value = 2;
        service.pointSize = value;
        expect(service.pointSize).toBe(value);
    });

    it('diameter shoult be min value if less than min', () => {
        const newMin = 0;
        service.diameter = newMin;
        expect(service.diameter).toBe(MIN_AEROSOL_DIAMETER);
    });

    it('diameter shoult be max value if more than max', () => {
        const bigger = 5000;
        service.diameter = bigger;
        expect(service.diameter).toBe(MAX_AEROSOL_DIAMETER);
    });

    it('diameter should be entered value if good value', () => {
        const diameterValue = 30;
        service.diameter = diameterValue;
        expect(service.diameter).toBe(diameterValue);
    });

    it('should ispointincanvas', () => {
        service.mouseDown = true;
        const mousePosition = { x: 2, y: 2 };
        service['mouseDownCoord'] = mousePosition;
        const diameter = 20;
        service.diameter = diameter;
        service['mousePosition'] = mousePosition;

        service['offscreenContext'] = offscreenContextStub;
        startSpraySpy = spyOn<any>(service, 'startSpray').and.callThrough();
        spyOn<any>(service, 'isPointInCanvas').and.returnValue(true);
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue(mousePosition);
        service.pathData = new Set<Vec2>();
        const addSpy = spyOn<any>(service.pathData, 'add').and.callThrough();
        service.onMouseDown(mouseEvent);

        expect(addSpy).not.toHaveBeenCalled();
    });

    it('isPointInCanvas should return false if x or y is negative', () => {
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: -1, y: -1 });
        service.onMouseDown(mouseEvent);
        expect(service['isPointInCanvas']({ x: -1, y: -1 })).toBe(false);
    });

    it('clearOffscreenContext shouldnt call isPointInCanvas if offscreencontext is undefined', () => {
        const isPointInCanvasSpy = spyOn<any>(service, 'isPointInCanvas').and.returnValue(false);
        service.clearOffscreenContext();
        expect(isPointInCanvasSpy).not.toHaveBeenCalled();
    });
});
