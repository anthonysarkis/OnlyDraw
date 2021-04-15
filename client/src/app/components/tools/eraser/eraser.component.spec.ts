import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EraserComponent } from './eraser.component';

describe('EraserComponent', () => {
    let component: EraserComponent;
    let fixture: ComponentFixture<EraserComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            declarations: [EraserComponent],
            providers: [{ provide: EraserService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EraserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' onThicknessChange should change eraser thickness', () => {
        const oldThickness = 10;
        component.eraserService.thickness = oldThickness;
        const newThickness = 20;
        component.onThicknessChange(newThickness);
        expect(component.eraserService.thickness).toBe(newThickness);
    });
});
