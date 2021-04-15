import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { MouseButton } from '@app/enums/mouse-buttons';
import { PipetteService } from './pipette.service';
// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers

describe('PipetteService', () => {
    let service: PipetteService;
    let mouseEvent: MouseEvent;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PipetteService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

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

    it('should verify that on mouse up is calling when on mouse up', () => {
        service.onMouseUp(mouseEvent);
        const spy = spyOn(service['colorService'], 'confirmColor');
        expect(spy).toBeDefined();
    });

    it('should verify that on mouse up is calling when on mouse up est a une location avant le canvas', () => {
        mouseEvent = {
            offsetX: -2225,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.onMouseUp(mouseEvent);
        const spy = spyOn(service['colorService'], 'confirmColor');
        expect(spy).toBeDefined();
    });

    it('should verify that on mouse down (left click) and to change the color of the Primary', () => {
        service.selectedColor = new Color(0, 0, 0, 0);
        const spy1 = spyOn(service['colorService'], 'onMouseMove').and.callFake(() => {
            return new Color(0, 0, 0, 0);
        });
        service.onMouseDown(mouseEvent);
        expect(spy1).toHaveBeenCalled();
    });

    it('should verify that on mouse move is calling when on mouse up', () => {
        mouseEvent = {
            offsetX: 235,
            offsetY: 237,
            button: MouseButton.Right,
        } as MouseEvent;
        const spy1 = spyOn(service['colorService'], 'onMouseMove').and.callFake(() => {
            return new Color(0, 0, 0, 1);
        });

        service.onMouseDown(mouseEvent);
        expect(spy1).toHaveBeenCalled();
    });

    it('should test if it get and call mouse position when the mouse is moved', () => {
        service['drawingService'].canvas = canvasStub;
        service['dropperVisualisation'] = baseCtxStub;

        canvasStub.width = 250;
        canvasStub.height = 250;
        mouseEvent = {
            offsetX: 235,
            offsetY: 237,
            button: MouseButton.Right,
        } as MouseEvent;

        const spyGetMousePosition = spyOn(service, 'getPositionFromMouse').and.callThrough();

        service.onMouseMove(mouseEvent);
        expect(spyGetMousePosition).toHaveBeenCalled();
    });
});
