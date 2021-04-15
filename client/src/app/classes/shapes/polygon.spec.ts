import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { MathService } from '@app/services/math/math.service';
import { Polygon } from './polygon';

// tslint:disable:no-string-literal
describe('Polygon', () => {
    let canvasTestHelper: CanvasTestHelper;
    let polygon: Polygon;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any
    let drawFillSpy: jasmine.Spy<any>;

    beforeEach(() => {
        const mathService = new MathService();
        polygon = new Polygon(0, 0, 0, mathService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(polygon).toBeTruthy();
        expect(baseCtxStub).toBeTruthy();
    });

    it('calculateDrawingPosition() to calculate the drawing position', () => {
        const drawingCoords: Vec2 = { x: 50, y: 50 };
        const width = 0;
        const height = 0;
        baseCtxStub.canvas.width = width;
        baseCtxStub.canvas.height = height;
        polygon['calculateDrawingPosition'](drawingCoords);
        expect(drawingCoords.x).toEqual(drawingCoords.x + width / 2);
        expect(drawingCoords.y).toEqual(drawingCoords.y + height / 2);
    });

    it('findSmallestSide should find the smallest side between the width and height', () => {
        const width = -50;
        const height = 25;
        polygon.width = width;
        polygon.height = height;
        polygon['findSmallestSide']();
        expect(polygon.width).toEqual(-height);
    });

    it('calling drawFill should set isFillOnly to true', () => {
        drawFillSpy = spyOn<any>(polygon, 'drawFill').and.callThrough();
        polygon.drawFill(previewCtxStub, { x: 2, y: 2 });
        expect(drawFillSpy).toHaveBeenCalled();
        expect(polygon['isFillOnly']).toBe(true);
    });

    it('should call draw enclosure when drawing border', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;
        const spy = spyOn<any>(polygon, 'drawEnclosure').and.callThrough();
        polygon.drawBorder(baseCtxStub, { x: 0, y: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call draw circle border when previewing countour', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;

        const spyRadius = spyOn<any>(polygon, 'calculateRadius').and.callThrough();
        const spyCircle = spyOn<any>(polygon, 'drawCircleBorder').and.callThrough();
        polygon.previewContour(baseCtxStub, { x: 0, y: 0 });
        expect(spyRadius).toHaveBeenCalled();
        expect(spyCircle).toHaveBeenCalled();
    });

    it('should not call draw circle border when previewing countour if radius<=widht and middlepoint is transparent', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;
        polygon['radius'] = 1;

        spyOn<any>(polygon, 'calculateRadius');
        const spyCircle = spyOn<any>(polygon, 'drawCircleBorder').and.callThrough();
        polygon.previewContour(previewCtxStub, { x: 0, y: 0 });
        expect(spyCircle).not.toHaveBeenCalled();
    });

    it('should call ctx fill when drawing fill', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;

        const spyFill = spyOn<any>(baseCtxStub, 'fill');
        polygon.drawFill(baseCtxStub, { x: 0, y: 0 });
        expect(spyFill).toHaveBeenCalled();
    });

    it('preview fill and preview border should call their respective drawing methods', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;
        const spyFill = spyOn<any>(polygon, 'drawFill');
        const spyBorder = spyOn<any>(polygon, 'drawBorder');
        polygon.previewFill(baseCtxStub, { x: 0, y: 0 });
        polygon.previewBorder(baseCtxStub, { x: 0, y: 0 });
        expect(spyFill).toHaveBeenCalled();
        expect(spyBorder).toHaveBeenCalled();
    });

    it('should call draw circle border with added value when previewing countour which is not filled', () => {
        const width = 20;
        const height = 20;
        polygon.width = width;
        polygon.height = height;
        polygon['isFillOnly'] = false;
        const spyRadius = spyOn<any>(polygon, 'calculateRadius').and.callThrough();
        const spyCircle = spyOn<any>(polygon, 'drawCircleBorder').and.callThrough();
        polygon.previewContour(baseCtxStub, { x: 0, y: 0 });
        expect(spyRadius).toHaveBeenCalled();
        expect(spyCircle).toHaveBeenCalled();
    });
});
