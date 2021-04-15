import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MAX_NUMBER_OF_SIDES, MIN_NUMBER_OF_SIDES } from '@app/classes/constants';
import { PolygonService } from './polygon.service';

describe('PolygoneService', () => {
    let service: PolygonService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatFormFieldModule, FormsModule, MatRadioModule],
        });
        service = TestBed.inject(PolygonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not set lower than minimum number of size', () => {
        const numberOfSides = -1;
        service.numberOfSides = numberOfSides;
        expect(service.numberOfSides).toEqual(MIN_NUMBER_OF_SIDES);
    });

    it('should not set higher than maximum number of size', () => {
        const numberOfSides = 100;
        service.numberOfSides = numberOfSides;
        expect(service.numberOfSides).toEqual(MAX_NUMBER_OF_SIDES);
    });
});
