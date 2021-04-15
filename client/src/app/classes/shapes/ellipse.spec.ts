import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Ellipse } from './ellipse';
// tslint:disable:no-string-literal
describe('Ellipse', () => {
    let canvasTestHelper: CanvasTestHelper;
    let ellipse: Ellipse;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any
    let spyBaseCtxFill: jasmine.Spy<any>;
    let spyBaseCtxBorder: jasmine.Spy<any>;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ellipse = new Ellipse(0, 0);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        spyBaseCtxFill = spyOn(baseCtxStub, 'fill').and.callThrough();
        spyBaseCtxBorder = spyOn(baseCtxStub, 'ellipse').and.callThrough();
    });

    it('should be created', () => {
        expect(ellipse).toBeTruthy();
    });

    it('ctx.ellipse should be called with right parameters in drawBorder if radius is positive', () => {
        const width = 15;
        const height = 25;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        const centerX = drawingCoords.x + width / 2;
        const centerY = drawingCoords.y + height / 2;
        const radiusX = width / 2 - baseCtxStub.lineWidth / 2;
        const radiusY = height / 2 - baseCtxStub.lineWidth / 2;
        ellipse.drawBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    });

    it('ctx.ellipse should be called with right parameters in drawFill and ctx.fill shoud be called', () => {
        const width = 200;
        const height = 100;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        const centerX = drawingCoords.x + width / 2;
        const centerY = drawingCoords.y + height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        ellipse.drawFill(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).toHaveBeenCalledWith(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        expect(spyBaseCtxFill).toHaveBeenCalled();
    });

    it('radius of ellipse should be positive when drawing', () => {
        const width = -200;
        const height = -100;
        ellipse.width = width;
        ellipse.height = height;
        const radiusX = width / 2;
        const radiusY = height / 2;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        ellipse.drawFill(baseCtxStub, drawingCoords);
        expect(ellipse.radius).toEqual({ x: Math.abs(radiusX), y: Math.abs(radiusY) });
    });

    it('radius of ellipse should reduce border length acording to lineWidth when drawing border', () => {
        const width = -200;
        const height = -100;
        ellipse.width = width;
        ellipse.height = height;
        const radiusX = Math.abs(width / 2) - baseCtxStub.lineWidth / 2;
        const radiusY = Math.abs(height / 2) - baseCtxStub.lineWidth / 2;
        const drawingCoords: Vec2 = { x: 18, y: 23 };
        ellipse.drawBorder(baseCtxStub, drawingCoords);
        expect(ellipse.radius).toEqual({ x: Math.abs(radiusX), y: Math.abs(radiusY) });
    });

    it('drawFill should be called  if radius is lower than lineWidth of context', () => {
        const width = 1;
        const height = 1;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        const lineWidth = 100;
        baseCtxStub.lineWidth = lineWidth;
        ellipse.drawBorder(baseCtxStub, drawingCoords);
        expect(spyBaseCtxFill).toHaveBeenCalled();
    });

    it('previewContour should preview the ellipse contour and not draw the ellipse', () => {
        const width = 19;
        const height = 91;
        ellipse.width = width;
        ellipse.height = height;
        const drawingCoords: Vec2 = { x: 0, y: 0 };
        ellipse.previewContour(baseCtxStub, drawingCoords);
        expect(spyBaseCtxBorder).not.toHaveBeenCalled();
    });
});
