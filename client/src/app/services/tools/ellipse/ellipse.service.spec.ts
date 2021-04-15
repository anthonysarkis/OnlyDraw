import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { EllipseService } from './ellipse.service';

describe('EllipseService', () => {
    let service: EllipseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
        });
        service = TestBed.inject(EllipseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
