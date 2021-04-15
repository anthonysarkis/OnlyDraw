import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    const routes: Route[] = [{ path: 'editor', component: EditorComponent }];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset canvas', fakeAsync(() => {
        fixture.ngZone?.run(() => {
            const spy = spyOn(component.drawingService, 'resetCanvas').and.callThrough();
            const spyCheckCanvas = spyOn(component.drawingService, 'checkIfSavedCanvas').and.returnValue(true);
            component.onOpenNewCanvas();
            expect(spy).toHaveBeenCalled();
            expect(spyCheckCanvas).toHaveBeenCalled();
        });
    }));

    it('should test that it restore the state', () => {
        const spy = spyOn(component.drawingService, 'resetCanvas');
        // tslint:disable: no-string-literal
        // tslint:disable: no-any
        spyOn<any>(component['drawingService'], 'checkIfSavedCanvas').and.returnValue(false);
        component.onOpenNewCanvas();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should clear history on continue canvas', () => {
        const spy = spyOn(component.drawingService.undoRedoService, 'clearHistory');
        component.onContinueCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
