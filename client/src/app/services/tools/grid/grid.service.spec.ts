import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService } from './grid.service';

describe('GridService', () => {
    let service: GridService;
    let canvasStub: HTMLCanvasElement;
    let canvasTestHelper: CanvasTestHelper;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatSliderModule, FormsModule, MatInputModule],
        });
        service = TestBed.inject(GridService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        ctxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        service.canvas = canvasStub;
        service.gridCtx = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('key + should increment size of grid', () => {
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'changeSquareSize');
        service.showGrid = true;
        service.onKeyDown({
            key: '=',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('key - should decrement size of grid', () => {
        const spy = spyOn<any>(service, 'changeSquareSize');
        service.showGrid = true;
        service.onKeyDown({
            key: '-',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('toggleGrid should clear grid', () => {
        const spy = spyOn<any>(service, 'clearGrid');
        service.showGrid = true;
        service.toggleGrid();
        expect(spy).toHaveBeenCalled();
    });

    it('get and set opacity should return opacity', () => {
        const opacity = 0.5;
        service.opacity = opacity;
        expect(service.opacity).toBe(opacity);
    });

    it('drawGrid should call drawRows if showGrid is true', () => {
        service.showGrid = true;
        const drawRowsSpy = spyOn<any>(service, 'drawRows').and.callThrough();
        service.drawGrid();
        expect(drawRowsSpy).toHaveBeenCalled();
    });

    it('clearGrid should call clearRect', () => {
        const spy = spyOn<any>(service.gridCtx, 'clearRect');
        service.clearGrid();
        expect(spy).toHaveBeenCalled();
    });

    it('onkeydown should call drawgrid if key is =', () => {
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'drawGrid');
        service.showGrid = true;
        service.onKeyDown({
            key: '=',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('toggleGrid should call clearGrid if showGrid is True', () => {
        service.showGrid = true;
        const spy = spyOn<any>(service, 'clearGrid').and.callThrough();
        service.toggleGrid();
        expect(spy).toHaveBeenCalled();
    });

    it('toggleGrid should not call clearGrid if showGrid is false', () => {
        service.showGrid = false;
        const spy = spyOn<any>(service, 'clearGrid').and.callThrough();
        service.toggleGrid();
        expect(spy).not.toHaveBeenCalled();
    });

    it('onKeyDown should not call changeSquareSize if showGrid is false', () => {
        const spy = spyOn<any>(service, 'changeSquareSize');
        service.showGrid = false;
        service.onKeyDown({
            key: '-',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).not.toHaveBeenCalled();
    });
});
