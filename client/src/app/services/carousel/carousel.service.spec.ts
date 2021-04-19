import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Observable, of, throwError } from 'rxjs';
import { CarouselService } from './carousel.service';

describe('CarouselService', () => {
    let service: CarouselService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    // tslint:disable: no-any
    let spyError: jasmine.SpyObj<any>;

    beforeEach(async(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas', 'drawCanvas', 'checkIfSavedCanvas', 'addCommand']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['clearHistory']);
        communicationServiceSpy = jasmine.createSpyObj('IndexService', ['getImage', 'getImagesByTag', 'getAllImages', 'deleteImage']);
        communicationServiceSpy.getImage.and.returnValue(of({ name: 'Hello', tags: ['hello'] }));
        communicationServiceSpy.getImagesByTag.and.returnValue(of([{ name: 'Hello', tags: ['hello'] }]));
        communicationServiceSpy.getAllImages.and.returnValue(of([{ name: 'Hello', tags: ['hello'] }]));
        communicationServiceSpy.deleteImage.and.returnValue(
            new Observable<void>((observer) => observer.next()),
        );
        drawServiceSpy.undoRedoService = undoRedoServiceSpy;
        drawServiceSpy.canvas = {
            toDataURL(): void {
                return;
            },
        } as HTMLCanvasElement;
        drawServiceSpy.canvasImage = new Image(0, 0);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatSnackBarModule, HttpClientTestingModule, BrowserAnimationsModule],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
        }).compileComponents();
        TestBed.inject(HttpTestingController);
        service = TestBed.inject(CarouselService);
        spyError = spyOn<any>(service, 'setError').and.callThrough();
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all images  from server when calling getAllImages', () => {
        service.getAllImages();
        expect(communicationServiceSpy.getAllImages).toHaveBeenCalled();
    });

    it('should get image by tag from server when calling getImagesByTag', () => {
        const tags = ['hello'];
        service.filterTags = tags;
        service.getImagesByTag();
        expect(communicationServiceSpy.getImagesByTag).toHaveBeenCalled();
    });

    it('should call delete when calling delete image', () => {
        service.images = [];
        service.images.push({ name: 'Hello', tags: ['hello'], _id: '1111' });
        service.onDeleteImage(0);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
    });

    it('should delete images even if images array is not empty', () => {
        service.images = [];
        service.images.push({ name: 'Hello', tags: ['hello'], _id: 'foss' });
        service.images.push({ name: 'Hello', tags: ['hello'], _id: '1111' });
        service.images.push({ name: 'Hello', tags: ['hello'], _id: 'foss' });
        service.images.push({ name: 'Hello', tags: ['hello'], _id: 'foss' });
        service.onDeleteImage(1);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
    });

    it('should manage errors when calling delete', () => {
        communicationServiceSpy.deleteImage.and.returnValue(throwError({ status: 404 }));
        service.images = [];
        service.images.push({ name: 'Hello', tags: ['hello'], _id: '1111' });
        service.onDeleteImage(0);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
        expect(spyError).toHaveBeenCalled();
    });

    it('should call get image when loading image', async(() => {
        service.images.push({ name: 'Hello', tags: ['hello'], _id: 'foss' });
        spyOn<any>(drawServiceSpy.canvas, 'toDataURL');
        service.onLoadImage(0);
        expect(communicationServiceSpy.getImage).toHaveBeenCalled();
    }));

    it('should set error state when server call returns error', async(() => {
        const numberOfCallsExpected = 3;
        service.images.push({ name: 'Hello', tags: ['hello'], _id: 'foss' });
        communicationServiceSpy.getImage.and.returnValue(throwError({ status: 404 }));
        communicationServiceSpy.getImagesByTag.and.returnValue(throwError({ status: 404 }));
        communicationServiceSpy.getAllImages.and.returnValue(throwError({ status: 404 }));
        spyOn<any>(drawServiceSpy.canvas, 'toDataURL');
        service.getImagesByTag();
        service.getAllImages();
        service.onLoadImage(0);
        expect(spyError).toHaveBeenCalledTimes(numberOfCallsExpected);
    }));

    it('should not change index size when click next or previous buttons ', () => {
        const imagesLength = 4;
        for (let i = 0; i < imagesLength; i++) {
            service.images.push({ name: 'Hello', tags: ['hello'] });
        }
        const indexLength = service.currentIndexes.length;
        service.onNextClick();
        expect(service.currentIndexes.length).toEqual(indexLength);
        service.onPreviousClick();
        expect(service.currentIndexes.length).toEqual(indexLength);
    });

    it('should not change index size when click next or previous buttons ', () => {
        const imagesLength = 4;
        for (let i = 0; i < imagesLength; i++) {
            service.images.push({ name: 'Hello', tags: ['hello'] });
        }
        const indexLength = service.currentIndexes.length;
        service.onNextClick();
        expect(service.currentIndexes.length).toEqual(indexLength);
        service.onPreviousClick();
        expect(service.currentIndexes.length).toEqual(indexLength);
    });

    it('should not have to confirm loading if canvas is empty', async(() => {
        drawServiceSpy.checkIfSavedCanvas.and.returnValue(false);
        const returnValue = service.confirmLoading();
        expect(returnValue).toBe(true);
    }));

    it('should have to confirm loading if canvas is not empty', async(() => {
        drawServiceSpy.checkIfSavedCanvas.and.returnValue(true);
        const returnValue = service.confirmLoading();
        expect(returnValue).toBe(false);
        service.showConfirmationMsg = false;
    }));

    it('should put the right previous index when calling previous click ', () => {
        service.currentIndexes = [];
        const currentIndexesLength = 3;
        for (let i = 0; i < currentIndexesLength; i++) {
            service.currentIndexes.push(0);
        }
        service.images = [];
        const imagesLength = 10;
        const expectedValue = imagesLength - 1;
        for (let i = 0; i < imagesLength; i++) {
            service.images.push({ name: 'Hello', tags: ['hello'] });
        }
        service.onPreviousClick();
        expect(service.currentIndexes[0]).toBe(expectedValue);
    });

    it('should not update indexes if images length is inferior to 2 ', () => {
        service.currentIndexes = [];
        const currentIndexesLength = 3;
        for (let i = 0; i < currentIndexesLength; i++) {
            service.currentIndexes.push(i + 2);
        }
        const expectedArray = service.currentIndexes;
        service.images = [];
        const imagesLength = 1;
        for (let i = 0; i < imagesLength; i++) {
            service.images.push({ name: 'Hello', tags: ['hello'] });
        }
        // tslint:disable-next-line: no-string-literal
        service['updateCurrentIndexes'](2);
        expect(service.currentIndexes).toBe(expectedArray);
    });

    it('should not change index arrays if number of indexes inferior to the minimum required ', () => {
        service.currentIndexes = [];
        const currentIndexesLength = 3;
        for (let i = 0; i < currentIndexesLength; i++) {
            service.currentIndexes.push(0);
        }
        service.images = [];
        const imagesLength = 0;
        for (let i = 0; i < imagesLength; i++) {
            service.images.push({ name: 'Hello', tags: ['hello'] });
        }
        const spyPush = spyOn<any>(service.currentIndexes, 'push');
        const spyShift = spyOn<any>(service.currentIndexes, 'shift');
        service.onNextClick();
        expect(spyPush).not.toHaveBeenCalled();
        expect(spyShift).not.toHaveBeenCalled();
    });
});
