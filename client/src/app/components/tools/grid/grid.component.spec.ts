import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, MatSliderModule, FormsModule, MatInputModule, MatFormFieldModule],
            declarations: [GridComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('grid should be seen', () => {
        const spy = spyOn(component.gridService, 'drawGrid');
        component.onShowGrid(true);
        expect(spy).toHaveBeenCalled();
    });

    it('grid should not be seen', () => {
        const spy = spyOn(component.gridService, 'clearGrid');
        component.onShowGrid(false);
        expect(spy).toHaveBeenCalled();
    });

    it('grid should clear and draw again when changed', () => {
        const spy = spyOn(component.gridService, 'clearGrid');
        const spy2 = spyOn(component.gridService, 'drawGrid');
        component.onGridChange();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('opacity should change', () => {
        const spy = spyOn(component, 'onGridChange');
        const opacity = 5;
        component.onOpacityChange(opacity);
        expect(spy).toHaveBeenCalled();
    });
});
