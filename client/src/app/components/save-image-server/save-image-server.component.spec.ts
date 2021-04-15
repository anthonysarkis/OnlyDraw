import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of, throwError } from 'rxjs';
import { SaveImageServerComponent } from './save-image-server.component';

describe('SaveImageServerComponent', () => {
    let component: SaveImageServerComponent;
    let fixture: ComponentFixture<SaveImageServerComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;

    beforeEach(async(() => {
        canvasTestHelper = new CanvasTestHelper();
        drawingService = new DrawingService({} as ColorService, {} as UndoRedoService);
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({
            declarations: [SaveImageServerComponent],
            imports: [
                HttpClientTestingModule,
                FormsModule,
                MatDialogModule,
                MatProgressSpinnerModule,
                MatChipsModule,
                MatInputModule,
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: DrawingService, useValue: drawingService },
                {
                    provide: MatDialogRef,
                    useValue: {
                        close(): void {
                            return;
                        },
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveImageServerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should push the event value to tags', () => {
        const event = { value: 'GOAT', input: {} as HTMLInputElement } as MatChipInputEvent;
        component.add(event);
        // tslint:disable: no-string-literal
        expect(component['checkTagValidity'](event.value)).not.toBeTrue();
    });

    it('should not push the event value to tags', () => {
        const event = { value: '', input: {} as HTMLInputElement } as MatChipInputEvent;
        component.add(event);
        expect(component['checkTagValidity'](event.value)).not.toBeTrue();
    });

    it('should remove the tag without errors', () => {
        const tag = 'NFT';
        const spy = spyOn(component.imageToSave.tags, 'splice').and.callThrough();
        component.imageToSave.tags.push(tag);
        component.remove(tag);
        expect(spy).toHaveBeenCalled();
    });

    it('should not splice tags if empty array', () => {
        const tag = 'NFT';
        const spy = spyOn(component.imageToSave.tags, 'splice').and.callThrough();
        component.imageToSave.tags = [];
        component.remove(tag);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should return false if tag is greater than maximum tag length', () => {
        const tag = 'NFTFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
        component.imageToSave.tags = [];
        const returnValue = component['checkTagValidity'](tag);
        expect(returnValue).toBe(false);
    });

    it('should verify if the tag is valid', () => {
        const tag = 'HODL';
        component['checkTagValidity'](tag);
        expect(component['checkTagValidity'](tag)).toBeTrue();
    });

    it('should send image to server using post image', () => {
        const tag = 'HODL';
        const name = 'Test';
        component.imageToSave.name = name;
        component.imageToSave.tags.push(tag);
        // tslint:disable: no-any
        const spyDialog = spyOn<any>(component['dialogRef'], 'close');
        const spy = spyOn<any>(component['communicationService'], 'postImage').and.returnValue(of('TEST'));
        component.sendImageToServer();
        expect(spy).toHaveBeenCalled();
        expect(spyDialog).toHaveBeenCalled();
    });

    it('error message should be updated', () => {
        const message = 'GOAT';
        component['setError'](message);
        expect(component.errorMsg).toEqual(message);
    });
    it('should manage error when sending image to server', () => {
        const tag = 'HODL';
        const name = 'Test';
        component.imageToSave.name = name;
        component.imageToSave.tags.push(tag);
        const spyDialog = spyOn<any>(component['dialogRef'], 'close');
        const spy = spyOn<any>(component['communicationService'], 'postImage').and.returnValue(throwError({ status: 404 }));
        component.sendImageToServer();
        expect(spy).toHaveBeenCalled();
        expect(spyDialog).not.toHaveBeenCalled();
    });
});
