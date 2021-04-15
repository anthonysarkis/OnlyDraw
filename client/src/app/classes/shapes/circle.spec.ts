import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Circle } from './circle';
// tslint:disable:no-string-literal
describe('Circle', () => {
    let canvasTestHelper: CanvasTestHelper;
    let ellipse: Circle;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any
    let spyBaseCtxFill: jasmine.Spy<any>;
    let spyBaseCtxBorder: jasmine.Spy<any>;
    let spySmallestSide: jasmine.Spy<any>;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ellipse = new Circle(0, 0);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        spyBaseCtxFill = spyOn(baseCtxStub, 'fill').and.callThrough();
        spyBaseCtxBorder = spyOn(baseCtxStub, 'ellipse').and.callThrough();
        spySmallestSide = spyOn<any>(ellipse, 'findSmallestSide').and.callThrough();
    });

    it('should be created', () => {
        expect(ellipse).toBeTruthy();
    });

    it('ctx.ellipse should be called with right parameters in drawBorder', () => {
        const width = 15;
        const height = 25;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        const centerX = drawingCoords.x + width / 2;
        const radiusX = width / 2 - baseCtxStub.lineWidth / 2;
        ellipse.drawBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(centerX, centerX, radiusX, radiusX, 0, 0, 2 * Math.PI);
    });

    it('ctx.ellipse should be called with right parameters in drawFill and ctx.fill shoud be called', () => {
        const width = 200;
        const height = 100;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        const centerX = drawingCoords.x + height / 2;
        const centerY = drawingCoords.y + height / 2;
        const radiusY = height / 2;
        ellipse.drawFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(centerX, centerY, radiusY, radiusY, 0, 0, 2 * Math.PI);
        expect(spyBaseCtxFill).toHaveBeenCalled();
    });

    it('radius of ellipse should be positive when drawing', () => {
        const width = -200;
        const height = -100;
        ellipse.width = width;
        ellipse.height = height;
        const radiusY = height / 2;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        ellipse.drawFill(baseCtxStub, drawingCoords);
        expect(ellipse.radius).toEqual({ x: Math.abs(radiusY), y: Math.abs(radiusY) });
    });

    it('radius of ellipse should reduce border length acording to lineWidth when drawing border', () => {
        const width = -200;
        const height = -100;
        ellipse.width = width;
        ellipse.height = height;
        const radiusY = Math.abs(height / 2) - baseCtxStub.lineWidth / 2;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        ellipse.drawBorder(baseCtxStub, drawingCoords);
        expect(ellipse.radius).toEqual({ x: Math.abs(radiusY), y: Math.abs(radiusY) });
    });

    it('previewBorder should find the smallest side and preview the circle', () => {
        const width = 200;
        const height = 100;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        ellipse.previewBorder(baseCtxStub, drawingCoords);
        expect(spySmallestSide).toHaveBeenCalled();
    });

    it('previewFill should find the smallest side and preview the filled circle', () => {
        const width = 420;
        const height = 100;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 69, y: 96 };
        ellipse.previewFill(baseCtxStub, drawingCoords);
        expect(spySmallestSide).toHaveBeenCalled();
    });
});
