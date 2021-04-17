import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { SelectionPolygonComponent } from './selection-polygon.component';

describe('SelectionPolygonComponent', () => {
    let component: SelectionPolygonComponent;
    let fixture: ComponentFixture<SelectionPolygonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatFormFieldModule, FormsModule, MatIconModule],
            declarations: [SelectionPolygonComponent, MagnetismComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPolygonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onCancelSelection should cancel selection', () => {
        const spy = spyOn(component.selectionService, 'endDrawing');
        component.onCancelSelection();
        expect(spy).toHaveBeenCalled();
    });
});
