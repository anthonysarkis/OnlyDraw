import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Square } from './square';
// tslint:disable:no-string-literal
describe('Square', () => {
    let canvasTestHelper: CanvasTestHelper;
    let square: Square;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable-next-line: no-any
    let spyBaseCtxFill: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let spyBaseCtxBorder: jasmine.Spy<any>;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        square = new Square(0, 0);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        spyBaseCtxFill = spyOn(baseCtxStub, 'rect').and.callThrough();
        spyBaseCtxBorder = spyOn(baseCtxStub, 'strokeRect').and.callThrough();
    });

    it('should be created', () => {
        expect(square).toBeTruthy();
    });

    it('ctx.rect should be called with right parameters in drawBorder', () => {
        const width = 15;
        const height = 25;
        square.width = width;
        square.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        square.drawBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, width);
    });

    it('ctx.rect should be called with right parameters in previewBorder', () => {
        const width = 8;
        const height = -10;
        square.width = width;
        square.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        square.previewBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, -width);
    });

    it('ctx.fillRect should be called with right parameters in drawFill', () => {
        const width = -1;
        const height = -1;
        square.width = width;
        square.height = height;
        const drawingCoords: Vec2 = { x: 1, y: 1 };
        square.drawFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxFill).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, width, height);
    });

    it('ctx.fillRect should be called with right parameters in previewFill', () => {
        const width = 100;
        const height = 20;
        square.width = width;
        square.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        square.previewFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxFill).toHaveBeenCalledWith(drawingCoords.x, drawingCoords.y, height, height);
    });

    it('square should choose the smallest side length', () => {
        let width = 100;
        let height = 20;
        square.width = width;
        square.height = height;
        square['findSmallestSide']();
        expect(square.width).toEqual(height);
        width = -width;
        height = -height;
        square.width = width;
        square.height = height;
        square['findSmallestSide']();
        expect(square.width).toEqual(height);
    });
});
