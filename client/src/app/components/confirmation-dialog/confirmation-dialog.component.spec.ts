import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    const routes: Route[] = [{ path: 'editor', component: EditorComponent }];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatDialogModule, RouterTestingModule.withRoutes(routes)],
            declarations: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not make a new canvas if not on editor ', () => {
        // tslint:disable: no-string-literal
        const spy = spyOn(component.drawingService, 'newCanvas').and.callFake(() => {
            return;
        });
        component.onConfirm();
        expect(spy).toHaveBeenCalled();
    });
});
