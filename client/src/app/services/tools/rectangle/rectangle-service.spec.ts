import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { RectangleService } from './rectangle-service';

describe('RectangleService', () => {
    let service: RectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
        });
        service = TestBed.inject(RectangleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
