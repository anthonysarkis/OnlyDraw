import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { Positions } from '@app/enums/magnetism-positions';
import { MagnetismeService } from './magnetisme.service';

describe('MagnetismeService', () => {
    let service: MagnetismeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatFormFieldModule, FormsModule],
        });
        service = TestBed.inject(MagnetismeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    it('toggleMagnet should toggle the button', () => {
        service.toggleMagnet();
        expect(service.applyMagnet).toBeTruthy();
    });

    it('calculateCorners should calculate the corners', () => {
        const corner = { x: 0, y: 0 };
        const factors = { x: 3, y: 3 };
        const dimensions = { width: 0, height: 0 };
        service['calculateCorners'](corner, factors, dimensions);
        expect(corner.y).toEqual(factors.y * service.gridService.squareSize + dimensions.height);
    });

    it('calculateFactors should calculate the factors', () => {
        const corner = { x: 0, y: 0 };
        service['calculateFactors'](corner);
        expect(corner.x).toEqual(Math.round(corner.x / service.gridService.squareSize));
    });

    it('should call top left handler if top left is selected', () => {
        const spy = spyOn<any>(service, 'topLeftHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.TopLeft;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call top right handler if top right is selected', () => {
        const spy = spyOn<any>(service, 'topRightHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.TopRight;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call top middle handler if top middle is selected', () => {
        const spy = spyOn<any>(service, 'topMiddleHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.TopMiddle;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call bottom left handler if bottom left is selected', () => {
        const spy = spyOn<any>(service, 'bottomLeftHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.BottomLeft;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call bottom middle handler if bottom middle is selected', () => {
        const spy = spyOn<any>(service, 'bottomMiddleHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.BottomMiddle;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call bottom right handler if bottom middle is selected', () => {
        const spy = spyOn<any>(service, 'bottomRightHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.BottomRight;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call middle right handler if middle right is selected', () => {
        const spy = spyOn<any>(service, 'middleRightHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.MiddleRight;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call middle left handler if middle left is selected', () => {
        const spy = spyOn<any>(service, 'middleLeftHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.MiddleLeft;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should call middle handler if middle is selected', () => {
        const spy = spyOn<any>(service, 'middleHandler').and.callThrough();
        service['bindOptions']();
        service.selectedOption = Positions.Middle;
        service.applyMagnet = true;
        service.adjustCorner({ x: 0, y: 0 }, { width: 0, height: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('should cancel left key movement on right key movement', () => {
        const currentCorner = { x: 0, y: 0 };
        const expectedCorner = { x: 0, y: 0 };
        service.jumpSquare(currentCorner, ArrowKeys.Right);
        service.jumpSquare(currentCorner, ArrowKeys.Left);
        expect(currentCorner).toEqual(expectedCorner);
    });

    it('should cancel up key movement on down key movement', () => {
        const currentCorner = { x: 0, y: 0 };
        const expectedCorner = { x: 0, y: 0 };
        service.jumpSquare(currentCorner, ArrowKeys.Down);
        service.jumpSquare(currentCorner, ArrowKeys.Up);
        expect(currentCorner).toEqual(expectedCorner);
    });
});
