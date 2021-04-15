import { fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { DrawingSliderComponent } from '@app/components/drawing-slider/drawing-slider.component';
import { ExportDialogComponent } from '@app/components/export-dialog/export-dialog.component';
import { SaveImageServerComponent } from '@app/components/save-image-server/save-image-server.component';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject, Subscription } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { DialogService } from './dialog.service';
export class TestComponent {}

describe('DialogService', () => {
    let service: DialogService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service = TestBed.inject(DialogService);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService = new DrawingService({} as ColorService, {} as UndoRedoService);
        drawingService.baseCtx = baseCtxStub;
        drawingService.canvas = canvasTestHelper.canvas;
    });

    it('initialize should initialize all dialogs', () => {
        // tslint:disable: no-string-literal
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['saveImageSubscription'] = new Subscription(() => {
            return;
        });
        service['exportSubscription'] = new Subscription(() => {
            return;
        });
        service['resetCanvasSubscription'] = new Subscription(() => {
            return;
        });
        service['drawingSliderSubscription'] = new Subscription(() => {
            return;
        });

        service['resetCanvasSubscription'] = new Subscription(() => {
            return;
        });
        service['drawingService'].confirmationDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<ConfirmationDialogComponent>);
        const spyCanvas = spyOn(service['drawingService'], 'clearCanvas');
        service.initialize();
        service['drawingService'].openConfirmationDialog();
        service.dialog.closeAll();
        expect(spy).not.toHaveBeenCalled();
        expect(spyCanvas).not.toHaveBeenCalled();
        expect(spyHotkey).not.toHaveBeenCalled();
    });

    it('initialize should initialize open confirmation dialog', () => {
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['drawingService'].confirmationDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<ConfirmationDialogComponent>);
        service.initialize();
        service['drawingService'].openConfirmationDialog();
        service.dialog.closeAll();
        expect(spy).toHaveBeenCalled();
        expect(spyHotkey).toHaveBeenCalled();
    });

    it('initialize should initialize open export dialog', () => {
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['drawingService'].exportDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<ExportDialogComponent>);
        service.initialize();
        service['drawingService'].openExportDialog();
        service.dialog.closeAll();
        expect(spy).toHaveBeenCalled();
        expect(spyHotkey).toHaveBeenCalled();
    });

    it('initialize should initialize open save dialog', () => {
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['drawingService'].saveDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<SaveImageServerComponent>);
        service.initialize();
        service['drawingService'].openSaveDialog();
        service.dialog.closeAll();
        expect(spy).toHaveBeenCalled();
        expect(spyHotkey).toHaveBeenCalled();
    });

    it('initialize should initialize open drawing slider dialog', () => {
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['drawingService'].carouselDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<DrawingSliderComponent>);
        service.initialize();
        service['drawingService'].openCarouselDialog();
        service.dialog.closeAll();
        expect(spy).toHaveBeenCalled();
        expect(spyHotkey).toHaveBeenCalled();
    });

    it('initialize should initialize open drawing slider dialog', () => {
        const spyHotkey = spyOn<any>(service, 'enableHotkeys');
        service['drawingService'].carouselDialog = new Subject<boolean>();
        const spy = spyOn(service.dialog, 'open').and.returnValue({ beforeClosed: () => of(true) } as MatDialogRef<DrawingSliderComponent>);
        service.initialize();
        service['drawingService'].openCarouselDialog();
        service.dialog.closeAll();
        expect(spy).toHaveBeenCalled();
        expect(spyHotkey).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from subscription', () => {
        service['saveImageSubscription'] = new Subscription(() => {
            return;
        });
        service['exportSubscription'] = new Subscription(() => {
            return;
        });
        service['resetCanvasSubscription'] = new Subscription(() => {
            return;
        });
        service['drawingSliderSubscription'] = new Subscription(() => {
            return;
        });

        service['resetCanvasSubscription'] = new Subscription(() => {
            return;
        });
        const spySave = spyOn<any>(service['saveImageSubscription'], 'unsubscribe');
        const spyExport = spyOn<any>(service['exportSubscription'], 'unsubscribe');
        const spyReset = spyOn<any>(service['resetCanvasSubscription'], 'unsubscribe');
        const spySlider = spyOn<any>(service['drawingSliderSubscription'], 'unsubscribe');
        service.ngOnDestroy();
        expect(spySave).toHaveBeenCalled();
        expect(spyExport).toHaveBeenCalled();
        expect(spyReset).toHaveBeenCalled();
        expect(spySlider).toHaveBeenCalled();
    });

    it('initialize should open dialog and call clearCanvas on confirm', fakeAsync(() => {
        const dialogRefSpyObj = jasmine.createSpyObj({ beforeClosed: of({}), close: null });
        service['dialogRef'] = dialogRefSpyObj;
        service['enableHotkeys']();
        expect(service['hotkeysService'].isHotkeysDisabled).toBe(false);
    }));
});
