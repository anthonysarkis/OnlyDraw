import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { SelectionEllipseComponent } from './selection-ellipse.component';

describe('SelectionEllipseComponent', () => {
    let component: SelectionEllipseComponent;
    let fixture: ComponentFixture<SelectionEllipseComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatFormFieldModule, FormsModule],
            declarations: [SelectionEllipseComponent, MagnetismComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionEllipseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onCancelSelection should end the ellipse selection', () => {
        const spy = spyOn(component.selectionService, 'endDrawing').and.callThrough();
        component.onCancelSelection();
        expect(spy).toHaveBeenCalled();
    });
});
