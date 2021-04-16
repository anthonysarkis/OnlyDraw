import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { Observable, of } from 'rxjs';
import { DrawingSliderComponent } from './drawing-slider.component';

describe('DrawingSliderComponent', () => {
    let component: DrawingSliderComponent;
    let fixture: ComponentFixture<DrawingSliderComponent>;
    let spyDetectChanges: jasmine.Spy;
    let spyGetImages: jasmine.Spy;
    let spyPreviousClick: jasmine.Spy;
    const routes: Route[] = [{ path: 'editor', component: EditorComponent }];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatIconModule,
                HttpClientTestingModule,
                MatSnackBarModule,
                MatDialogModule,
                MatFormFieldModule,
                FormsModule,
                RouterTestingModule.withRoutes(routes),
                MatProgressSpinnerModule,
                MatChipsModule,
            ],
            declarations: [DrawingSliderComponent, EditorComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close(): void {
                            return;
                        },
                        beforeClosed(): Observable<boolean> {
                            return of(true);
                        },
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ],
        }).compileComponents();
        TestBed.inject(HttpTestingController);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // tslint:disable: no-string-literal
        spyDetectChanges = spyOn(component['cd'], 'detectChanges');
        spyGetImages = spyOn(component, 'getImages').and.callThrough();
        spyPreviousClick = spyOn(component.carouselService, 'onPreviousClick').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should detect changes when deleting and image', () => {
        const index = 0;
        spyOn(component.carouselService, 'onDeleteImage');
        component.onDeleteImage(index);
        expect(spyDetectChanges).toHaveBeenCalled();
    });

    it('should remove a tag name', () => {
        const NFT = 'NFT';
        component.remove(NFT);
        expect(spyGetImages).toHaveBeenCalled();
    });

    it('should call previous click on left key press', () => {
        const event = { key: ArrowKeys.Left } as KeyboardEvent;
        component.onKeyDown(event);
        expect(spyPreviousClick).toHaveBeenCalled();
    });

    it('should call next click on right key press', () => {
        const event = { key: ArrowKeys.Right } as KeyboardEvent;
        // tslint:disable: no-any
        const spyNext = spyOn<any>(component.carouselService, 'onNextClick');
        component.onKeyDown(event);
        expect(spyNext).toHaveBeenCalled();
    });

    it('should get images after trying to add tag', () => {
        let event = { value: 'TAG', input: {} as HTMLInputElement } as MatChipInputEvent;
        component.add(event);
        expect(spyGetImages).toHaveBeenCalled();
        event = {} as MatChipInputEvent;
        component.add(event);
        expect(spyGetImages).toHaveBeenCalled();
    });

    it('should close the dialog when the image gets loaded', fakeAsync(() => {
        component.carouselService.showConfirmationMsg = true;
        const spyDialog = spyOn<any>(component['dialogRef'], 'close');
        spyOnProperty(component['router'], 'url', 'get').and.returnValue('');
        const spyCarousel = spyOn<any>(component.carouselService, 'onLoadImage').and.returnValue(Promise.resolve(true));
        const spyRouter = spyOn<any>(component['router'], 'navigate');
        component.onLoadImage(0).then(() => {
            expect(spyDialog).toHaveBeenCalled();
            expect(spyCarousel).toHaveBeenCalled();
            expect(spyRouter).toHaveBeenCalled();
        });
        tick();
    }));

    it('should not close the dialog if images does not get loaded', fakeAsync(() => {
        component.carouselService.showConfirmationMsg = true;
        spyOnProperty(component['router'], 'url', 'get').and.returnValue('');
        const spyDialog = spyOn<any>(component['dialogRef'], 'close');
        const spyCarousel = spyOn<any>(component.carouselService, 'onLoadImage').and.returnValue(Promise.resolve(false));
        const spyRouter = spyOn<any>(component['router'], 'navigate');
        component.onLoadImage(0).then(() => {
            expect(spyDialog).not.toHaveBeenCalled();
            expect(spyCarousel).toHaveBeenCalled();
            expect(spyRouter).not.toHaveBeenCalled();
        });
        tick();
    }));

    it('should not route if already on editor', fakeAsync(() => {
        fixture.ngZone?.run(() => {
            component.carouselService.showConfirmationMsg = true;
            const spyDialog = spyOn<any>(component['dialogRef'], 'close');
            const spyCarousel = spyOn<any>(component.carouselService, 'onLoadImage').and.returnValue(Promise.resolve(true));
            const spyRouter = spyOn<any>(component['router'], 'navigate');
            spyOnProperty(component['router'], 'url', 'get').and.returnValue('/editor');
            component.onLoadImage(0).then(() => {
                expect(spyDialog).toHaveBeenCalled();
                expect(spyCarousel).toHaveBeenCalled();
                expect(spyRouter).not.toHaveBeenCalled();
            });
            tick();
        });
    }));

    it('should not load image if confirmation message was not confirmed', fakeAsync(() => {
        component.carouselService.showConfirmationMsg = false;
        spyOnProperty(component['router'], 'url', 'get').and.returnValue('');
        const spyCheckLoad = spyOn<any>(component.carouselService, 'confirmLoading').and.returnValue(false);
        const spyCarousel = spyOn<any>(component.carouselService, 'onLoadImage').and.returnValue(Promise.resolve(false));
        component.onLoadImage(0).then(() => {
            expect(spyCarousel).not.toHaveBeenCalled();
        });
        tick();
        expect(spyCheckLoad).toHaveBeenCalled();
    }));

    it('should get all images if filter array is empty', () => {
        component.carouselService.filterTags = [];
        const spy = spyOn<any>(component.carouselService, 'getAllImages');
        component.getImages();
        expect(spy).toHaveBeenCalled();
    });

    it('should get images with filter tags if filter array is not empty', () => {
        component.carouselService.filterTags = [];
        component.carouselService.filterTags.push('foss');
        const spy = spyOn<any>(component.carouselService, 'getImagesByTag');
        component.getImages();
        expect(spy).toHaveBeenCalled();
    });

    it('should always get images on remove', () => {
        component.carouselService.filterTags = [];
        component.remove('0');
        expect(spyGetImages).toHaveBeenCalled();
        component.carouselService.filterTags.push('0');
        component.remove('0');
        expect(spyGetImages).toHaveBeenCalled();
    });
});
