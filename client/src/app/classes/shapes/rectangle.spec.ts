import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Rectangle } from './rectangle';

// tslint:disable:no-string-literal
describe('Rectangle', () => {
    let canvasTestHelper: CanvasTestHelper;
    let rectangle: Rectangle;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any
    let spyBaseCtxFill: jasmine.Spy<any>;
    let spyBaseCtxBorder: jasmine.Spy<any>;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        rectangle = new Rectangle(0, 0);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        spyBaseCtxFill = spyOn(baseCtxStub, 'rect').and.callThrough();
        spyBaseCtxBorder = spyOn(baseCtxStub, 'strokeRect').and.callThrough();
    });

    it('should be created', () => {
        expect(rectangle).toBeTruthy();
    });

    it('ctx.rect should be called with right parameters in drawBorder', () => {
        const width = 15;
        const height = 25;
        rectangle.width = width;
        rectangle.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        rectangle.drawBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, height);
    });

    it('ctx.rect should be called with right parameters in previewBorder', () => {
        const width = 0;
        const height = 0;
        rectangle.width = width;
        rectangle.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        rectangle.previewBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, height);
    });

    it('ctx.fillRect should be called with right parameters in drawFill', () => {
        const width = -1;
        const height = -1;
        rectangle.width = width;
        rectangle.height = height;
        const drawingCoords: Vec2 = { x: 1, y: 1 };
        rectangle.drawFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxFill).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, height);
    });

    it('ctx.fillRect should be called with right parameters in previewFill', () => {
        const width = 0;
        const height = 100;
        rectangle.width = width;
        rectangle.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        rectangle.previewFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxFill).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, height);
    });
});
