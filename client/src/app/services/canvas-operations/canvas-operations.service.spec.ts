import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH } from '@app/classes/constants';
import { Anchor } from '@app/enums/drag-anchors';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { CanvasOperationsService } from './canvas-operations.service';

describe('CanvasOperationsService', () => {
    let service: CanvasOperationsService;
    let imageServiceSpy: jasmine.SpyObj<ImageHelperService>;

    beforeEach(() => {
        imageServiceSpy = jasmine.createSpyObj('ImageHelperService', ['getSelectedImage']);
        TestBed.configureTestingModule({
            providers: [{ provide: ImageHelperService, useValue: imageServiceSpy }],
        });
        service = TestBed.inject(CanvasOperationsService);

        const bottomRightAnchorPosition = { x: 400, y: 400 };
        const rightMiddleAnchor = { x: 400, y: 400 };
        const bottomMiddleAnchor = { x: 400, y: 400 };
        const previewDimensions = { width: 500, height: 500 };
        const canvasDimensions = { width: 0, height: 0 };
        service.anchors[Anchor.BottomRightAnchor] = bottomRightAnchorPosition;
        service.anchors[Anchor.RightMiddleAnchor] = rightMiddleAnchor;
        service.anchors[Anchor.BottomMiddleAnchor] = bottomMiddleAnchor;
        service.previewDimensions = previewDimensions;
        service.canvasDimensions = canvasDimensions;
    });

    it('canvasDimensionsValidation should set previewDimensions.x to minimum width', () => {
        const width = 200;
        service.previewDimensions.width = width;
        service.updateCanvasDimensions(width, 0);
        expect(service.previewDimensions.width).toEqual(MIN_CANVAS_WIDTH);
    });

    it('canvasDimensionsValidation should set previewDimensions.y to minimum height', () => {
        const height = 200;
        service.previewDimensions.height = height;
        service.updateCanvasDimensions(0, height);
        expect(service.previewDimensions.width).toEqual(MIN_CANVAS_HEIGHT);
    });

    it('canvasDimensionsValidation should not affect width and height values above min', () => {
        const width = 400;
        const height = 400;
        service.previewDimensions.width = width;
        service.previewDimensions.height = height;
        service.updateCanvasDimensions(width, height);
        expect(service.previewDimensions.height).toEqual(height);
        expect(service.previewDimensions.width).toEqual(width);
    });

    it('updateCanvasDimensions should set bottomRightAnchor.x to previewDimensions.x and bottomRightAnchor.y to previewDimensions.y', () => {
        const previewDimensions = { width: 500, height: 500 };
        service.previewDimensions = previewDimensions;
        service.updateCanvasDimensions(previewDimensions.width, previewDimensions.height);
        expect(service.anchors[Anchor.BottomRightAnchor]).toEqual({ x: previewDimensions.width, y: previewDimensions.height });
    });

    it('updateAnchorPositions should set bottomMiddleAnchor.x to previewDimensions.x and bottomMiddleAnchor.y to previewDimensions.y', () => {
        const bottomMiddleAnchor = { x: 400, y: 400 };
        const previewDimensions = { x: 500, y: 500 };
        service.anchors[Anchor.BottomMiddleAnchor] = bottomMiddleAnchor;
        service.previewDimensions = { width: previewDimensions.x, height: previewDimensions.y };
        // tslint:disable: no-any
        spyOn<any>(service, 'updateAnchorPositions').and.callThrough();
        service.updateCanvasDimensions(previewDimensions.x, previewDimensions.y);
        expect(service.anchors[Anchor.BottomMiddleAnchor].x).toEqual(previewDimensions.x / 2);
        expect(service.anchors[Anchor.BottomMiddleAnchor].y).toEqual(previewDimensions.y);
    });

    it('dragEnd should update anchor positions and validate the canvas size ', () => {
        const rightMiddleAnchor = { x: 400, y: 400 };
        const previewDimensions = { x: 500, y: 500 };
        service.anchors[Anchor.RightMiddleAnchor] = rightMiddleAnchor;
        service.previewDimensions = { width: previewDimensions.x, height: previewDimensions.y };
        const event = {} as CdkDragEnd;
        event.source = {
            freeDragPosition: { x: 0, y: 0 },
            getFreeDragPosition(): {
                readonly x: number;
                readonly y: number;
            } {
                return event.source.freeDragPosition;
            },
        } as CdkDrag<HTMLElement>;
        event.source.freeDragPosition.x = 1;
        event.source.freeDragPosition.y = 1;
        const spyUpdate = spyOn<any>(service, 'updatePreviewDimensions').and.callThrough();
        service.dragEnd(event, true, true);
        expect(spyUpdate).toHaveBeenCalled();
        expect(imageServiceSpy.getSelectedImage).toHaveBeenCalled();
    });

    it('DragMove should change previewCanvasValues for x and y if corner anchor ', () => {
        const event = {} as CdkDragMove;
        event.source = {
            freeDragPosition: { x: 0, y: 0 },
            getFreeDragPosition(): {
                readonly x: number;
                readonly y: number;
            } {
                return event.source.freeDragPosition;
            },
        } as CdkDrag<HTMLElement>;
        event.source.freeDragPosition.x = 1;
        event.source.freeDragPosition.y = 1;
        const spyUpdate = spyOn<any>(service, 'updatePreviewDimensions').and.callThrough();
        service.dragMove(event, true, true);
        expect(spyUpdate).toHaveBeenCalled();
    });

    it('DragMove should change previewCanvasValues for x and y if bottom middle and middle left anchors ', () => {
        const event = {} as CdkDragMove;
        event.source = {
            freeDragPosition: { x: 0, y: 0 },
            getFreeDragPosition(): {
                readonly x: number;
                readonly y: number;
            } {
                return event.source.freeDragPosition;
            },
        } as CdkDrag<HTMLElement>;
        event.source.freeDragPosition.x = 1;
        event.source.freeDragPosition.y = 1;
        const spyUpdate = spyOn<any>(service, 'updatePreviewDimensions').and.callThrough();
        service.dragMove(event, true, false);
        expect(spyUpdate).toHaveBeenCalled();
        service.dragMove(event, false, true);
        expect(spyUpdate).toHaveBeenCalled();
    });

    it('setDefaultDimensions should call updateCanvasDimensions', () => {
        const spy = spyOn<any>(service, 'updateCanvasDimensions');
        service.setDefaultDimensions();
        expect(spy).toHaveBeenCalled();
    });
});
