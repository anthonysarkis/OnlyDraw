import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LassoShape } from './lasso-shape';
// tslint:disable:no-string-literal
describe('Ellipse', () => {
    let canvasTestHelper: CanvasTestHelper;
    let lassoShape: LassoShape;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        lassoShape = new LassoShape([]);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(lassoShape).toBeTruthy();
    });

    it('should create path with lineTo when calling drawFill', () => {
        const spy = spyOn<any>(baseCtxStub, 'lineTo').and.callThrough();
        lassoShape.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        lassoShape.drawFill(baseCtxStub, { x: 0, y: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should stroke after drawFill when calling drawBorder', () => {
        const spyFill = spyOn<any>(lassoShape, 'drawFill').and.callThrough();
        const spyStroke = spyOn<any>(baseCtxStub, 'stroke').and.callThrough();

        lassoShape.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        lassoShape.drawBorder(baseCtxStub, { x: 0, y: 0 });
        expect(spyFill).toHaveBeenCalled();
        expect(spyStroke).toHaveBeenCalled();
    });

    it('should not change shape state on preview', () => {
        const spyFill = spyOn<any>(lassoShape, 'drawFill').and.callThrough();
        const spyStroke = spyOn<any>(baseCtxStub, 'stroke').and.callThrough();

        lassoShape.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const pathData = lassoShape.pathData;
        lassoShape.previewBorder(baseCtxStub, { x: 0, y: 0 });
        lassoShape.previewContour(baseCtxStub, { x: 0, y: 0 });
        lassoShape.previewFill(baseCtxStub, { x: 0, y: 0 });
        expect(spyFill).not.toHaveBeenCalled();
        expect(spyStroke).not.toHaveBeenCalled();
        expect(pathData).toEqual(lassoShape.pathData);
    });
});
