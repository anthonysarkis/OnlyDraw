import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { AerosolComponent } from './aerosol.component';

describe('AerosolComponent', () => {
    let component: AerosolComponent;
    let fixture: ComponentFixture<AerosolComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            declarations: [AerosolComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AerosolComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onDiameterChange should change diameter', () => {
        const newDiameter = 25;
        component.onDiameterChange(newDiameter);
        expect(component.diameter).toBe(newDiameter);
    });

    it('onPointSizeChange should change pointSize', () => {
        const newPointSize = 2;
        component.onPointSizeChange(newPointSize);
        expect(component.pointSize).toBe(newPointSize);
    });

    it('onEmissionsChange should change emissions', () => {
        const newEmissions = 25;
        component.onEmissionsChange(newEmissions);
        expect(component.emissions).toBe(newEmissions);
    });
});
