import { TestBed } from '@angular/core/testing';

import { SelectionEllipseService } from './selection-ellipse.service';

describe('SelectionEllipseService', () => {
    let service: SelectionEllipseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionEllipseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
