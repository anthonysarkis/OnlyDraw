import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Filters } from '@app/enums/filters';
import { ImageFormat } from '@app/enums/image-formats';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImgurService } from '@app/services/imgur/imgur.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let imgurSpy: jasmine.SpyObj<ImgurService>;
    // tslint:disable: no-any
    let spyDrawImage: jasmine.SpyObj<any>;

    beforeEach(() => {
        drawingService = new DrawingService({} as ColorService, {} as UndoRedoService);
        canvasTestHelper = new CanvasTestHelper();
        drawingService.canvas = canvasTestHelper.canvas;
        imgurSpy = jasmine.createSpyObj('ImgurService', ['uploadImgur']);
        TestBed.configureTestingModule({
            imports: [MatFormFieldModule, MatSelectModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [
                { provide: DrawingService, useValue: drawingService },
                { provide: ImgurService, useValue: imgurSpy },
            ],
        });
        service = TestBed.inject(ExportService);
        // tslint:disable: no-string-literal
        service['dimensions'] = { width: 0, height: 0 };
        canvasStub = canvasTestHelper.canvas;
        service.canvas = canvasStub;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service.ctx = baseCtxStub;
        service['filters'] = new Map<string, string>();
        service['image'] = new Image();
        spyDrawImage = spyOn<any>(baseCtxStub, 'drawImage');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setDefaultOptions() resets the options on the export dialog to default', () => {
        service['setDefaultOptions']();
        expect(service.filter).toEqual(Filters.NoFilter);
        expect(service.format).toEqual(ImageFormat.Jpeg);
        expect(service.fileName).toEqual('Dessin');
    });

    it('should test that apply filters should save and restore the context', fakeAsync(() => {
        service.filter = Filters.DogFilter;
        spyOn(service['filters'], 'has').and.callFake(() => {
            return false;
        });

        const spySave = spyOn(service.ctx, 'save');
        const spyRestore = spyOn(service.ctx, 'restore');
        service.applyFilter();
        tick();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    }));

    it('it should the case where filter is an invalid filter', fakeAsync(() => {
        service.filter = Filters.DogFilter;
        spyOn(service['filters'], 'has').and.callFake(() => {
            return true;
        });
        const spySave = spyOn(service.ctx, 'save');
        const spyRestore = spyOn(service.ctx, 'restore');
        service.applyFilter();
        tick();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
    }));

    it('it should the case where filter is a valid filter', fakeAsync(() => {
        service.filter = Filters.DogFilter;
        spyOn(service['filters'], 'has').and.callFake(() => {
            return true;
        });
        const spyApplySpecialFilter = spyOn<any>(service, 'applySpecialFilter');
        const spySave = spyOn(service.ctx, 'save');
        const spyRestore = spyOn(service.ctx, 'restore');
        service.applyFilter();
        tick();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyApplySpecialFilter).not.toHaveBeenCalled();
    }));

    it('test that GMEfilter is working', fakeAsync(() => {
        service.filter = Filters.GmeFilter;
        spyOn(service['filters'], 'has').and.callFake(() => {
            return false;
        });
        const spySave = spyOn(service.ctx, 'save');
        const spyRestore = spyOn(service.ctx, 'restore');
        service.applyFilter();
        tick();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
    }));

    it('it should test when the filter is not a special filter', fakeAsync(() => {
        service.filter = '100';
        spyOn(service['filters'], 'has').and.callFake(() => {
            return false;
        });
        const spySave = spyOn(service.ctx, 'save');
        const spyRestore = spyOn(service.ctx, 'restore');
        service.applyFilter();
        tick();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
    }));

    it('it should test that an image is initialised', fakeAsync(() => {
        service.filter = Filters.DogFilter;
        const spy = spyOn(service['imageService'], 'getSelectedImage');
        const canvasWidth = 500;
        canvasStub.width = canvasWidth;
        service.initializeImage();
        tick();
        expect(spy).toHaveBeenCalled();
    }));

    it('it should verify that it is exporting an image', () => {
        service.filter = Filters.DogFilter;
        const huhu: HTMLAnchorElement = {
            href: 'bonjus',
            download: 'bonjus2',
            click(): void {
                return;
            },
        } as HTMLAnchorElement;
        const spyTEST = spyOn<any>(document, 'createElement').and.returnValue(huhu);
        const spy = spyOn<any>(service, 'setDefaultOptions');
        service.exportImage();
        expect(spyTEST).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should open the snackbar', () => {
        const spySnackBar = spyOn<any>(service['snackBar'], 'open');
        service.showSnackbar();
        expect(spySnackBar).toHaveBeenCalled();
    });

    it('should show imgur message when exporting on imgur', () => {
        imgurSpy.uploadImgur.and.returnValue(of({ data: 'test.com' } as HTMLObjectElement));
        service.exportImgur();
        expect(imgurSpy.uploadImgur).toHaveBeenCalled();
    });
});
