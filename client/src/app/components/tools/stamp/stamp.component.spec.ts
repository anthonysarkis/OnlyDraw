import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { StampComponent } from './stamp.component';

describe('StampComponent', () => {
    let component: StampComponent;
    let fixture: ComponentFixture<StampComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatFormFieldModule, FormsModule],
            declarations: [StampComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onAngleDegreeChange should change currentAngle', () => {
        const newAngle = 60;
        component.onAngleDegreeChange(newAngle);
        expect(component.currentAngle).toBe(newAngle);
    });

    it('onScaleChange should change currentScale', () => {
        const newScale = 3;
        component.onScaleChange(newScale);
        expect(component.currentScale).toBe(newScale);
    });

    it('onChangeStampImage should call changeStampImage', () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(component.stampService, 'changeStampImage');
        component.onChangeStampImage(1);
        expect(spy).toHaveBeenCalled();
    });
});
