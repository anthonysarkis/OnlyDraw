import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { SelectionRectangleComponent } from './selection-rectangle.component';

describe('SelectionRectangleComponent', () => {
    let component: SelectionRectangleComponent;
    let fixture: ComponentFixture<SelectionRectangleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatFormFieldModule, FormsModule],
            declarations: [SelectionRectangleComponent, MagnetismComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionRectangleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should cancel the rectangle selection', () => {
        const spy = spyOn(component.selectionService, 'endDrawing').and.callThrough();
        component.onCancelSelection();
        expect(spy).toHaveBeenCalled();
    });
});
