import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MagnetismComponent } from './magnetism.component';

describe('MagnetismComponent', () => {
    let component: MagnetismComponent;
    let fixture: ComponentFixture<MagnetismComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MagnetismComponent],
            imports: [MatSlideToggleModule, MatFormFieldModule, FormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetismComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onApplyMagnet should switch the magnetism on and off', () => {
        const foo = component.magnetism.applyMagnet;
        component.onApplyMagnet();
        expect(foo).not.toEqual(component.magnetism.applyMagnet);
    });
});
