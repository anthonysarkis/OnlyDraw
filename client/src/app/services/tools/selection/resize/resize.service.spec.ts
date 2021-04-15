import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { Anchor } from '@app/enums/drag-anchors';
import { ResizeService } from './resize.service';

describe('ResizeService', () => {
    let service: ResizeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ResizeService);
        // tslint:disable: no-any
        // tslint:disable: no-string-literal
        service['resizeBindings'] = new Map<Anchor, (position: Vec2) => void>();
        service['mirrorBindings'] = new Map<Anchor, () => void>();
        service['shiftBindings'] = new Map<Anchor, () => void>();
        service['selectedAnchor'] = 0;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' isShiftDown should return the given value', () => {
        const shift = true;
        service.isShiftDown = shift;
        expect(service.isShiftDown).toBe(shift);
    });

    it(' isShiftDown should update dimensions if border is selected', () => {
        const shift = true;
        service['selectedAnchor'] = 1;
        service['isBorderSelected'] = true;
        service['bindResizingHandlers']();
        service['bindShiftHandlers']();
        service['bindMirrorHandlers']();
        service.isShiftDown = shift;
        expect(service.isShiftDown).toBe(shift);
    });

    it(' isShiftDown should not update dimensions if border not selected', () => {
        const shift = false;
        service['isBorderSelected'] = false;
        service.isShiftDown = shift;
        expect(service.isShiftDown).toBe(shift);
    });

    it('dragMove should change previewDimensions for selected anchor ', () => {
        const event = {} as CdkDragMove;
        service.isShiftDown = true;
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
        service['bindResizingHandlers']();
        service['bindShiftHandlers']();
        const updateSpy = spyOn<any>(service, 'updatePreviewDimensions').and.callThrough();
        const nAnchors = 8;
        for (let i = 0; i < nAnchors; i++) {
            service.dragMove(event, i);
        }
        expect(updateSpy).toHaveBeenCalled();
    });

    it('dragEnd should update anchor positions and update selection properties ', () => {
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
        service['bindResizingHandlers']();
        service['bindShiftHandlers']();
        service['bindMirrorHandlers']();
        const updateSpy = spyOn<any>(service, 'updateProperties').and.callThrough();
        service.dimensions = { width: 0, height: 0 };
        service.previewDimensions = { width: 0, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.previewCorners[1] = { x: 0, y: 0 };
        service.corners[0] = { x: 0, y: 0 };
        service.corners[1] = { x: 0, y: 0 };
        service['lastPosition'] = { x: 0, y: 0 };
        const nAnchors = 8;
        for (let i = 0; i < nAnchors; i++) {
            service['selectedAnchor'] = i;
            service.dragEnd();
        }
        expect(updateSpy).toHaveBeenCalled();
    });

    it('equalizeDimensions should equalize the height if smaller than width', () => {
        service.previewDimensions = { width: 1, height: 0 };
        spyOn(service['shiftBindings'], 'get').and.returnValue(() => {
            return;
        });
        service['equalizeDimensions'](0);
        expect(service.previewDimensions.width).toEqual(service.previewDimensions.height);
    });

    it('positiveXShift set previewCorner to corner minus dimension', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[0] = { x: 1, y: 1 };
        service['positiveXShift']();
        expect(service.corners[0].x).toEqual(1);
    });

    it('positiveYShift set previewCorner to corner minus dimension', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[0] = { x: 1, y: 1 };
        service['positiveYShift']();
        expect(service.corners[0].x).toEqual(1);
    });

    it('negativeXShift set previewCorner to corner minus dimension', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[1] = { x: 1, y: 1 };
        service['negativeXShift']();
        expect(service.corners[1].x).toEqual(1);
    });

    it('negativeYShift set previewCorner to corner minus dimension', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[1] = { x: 1, y: 1 };
        service['negativeYShift']();
        expect(service.corners[1].x).toEqual(1);
    });

    it('leftMiddleHandler should correctly assign corners and dimensions', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.dimensions = { width: 1, height: 1 };
        service.corners[0] = { x: 1, y: 1 };
        service['leftMiddleHandler']({ x: 0, y: 0 });
        expect(service.corners[0].x).toEqual(1);
    });

    it('bottomMiddleHandler should correctly assign corners and dimensions', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.dimensions = { width: 1, height: 1 };
        service.corners[0] = { x: 1, y: 1 };
        const yPosition = 10;
        service['bottomMiddleHandler']({ x: 0, y: -yPosition });
        expect(service.corners[0].x).toEqual(1);
    });

    it('topMiddleHandler should correctly assign corners and dimensions', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.dimensions = { width: 1, height: 1 };
        service.corners[0] = { x: 1, y: 1 };
        service['topMiddleHandler']({ x: 0, y: 0 });
        expect(service.corners[0].x).toEqual(1);
    });

    it('rightMiddleHandler should correctly assign corners and dimensions', () => {
        service.previewDimensions = { width: 1, height: 0 };
        service.previewCorners[0] = { x: 0, y: 0 };
        service.dimensions = { width: 1, height: 1 };
        service.corners[0] = { x: 1, y: 1 };
        const xPosition = 10;
        service['rightMiddleHandler']({ x: -xPosition, y: 0 });
        expect(service.corners[0].x).toEqual(1);
    });

    it('negativeYMirror should correctly set the mirror on the y axis', () => {
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[1] = { x: 1, y: 1 };
        service['negativeYMirror']();
        expect(service.corners[1].x).toEqual(1);
    });

    it('negativeXMirror should correctly set the mirror on the y axis', () => {
        service.previewCorners[0] = { x: 0, y: 0 };
        service.corners[1] = { x: 1, y: 1 };
        service['negativeXMirror']();
        expect(service.corners[1].x).toEqual(1);
    });

    it('positiveYMirror should correctly set the mirror on the y axis', () => {
        service.previewCorners[0] = { x: 1, y: 0 };
        service.corners[0] = { x: 0, y: 1 };
        service['positiveYMirror']();
        expect(service.corners[0].x).toEqual(0);
    });

    it('positiveXMirror should correctly set the mirror on the y axis', () => {
        service.previewCorners[0] = { x: 1, y: 0 };
        service.corners[0] = { x: 0, y: 1 };
        service['positiveXMirror']();
        expect(service.corners[0].x).toEqual(0);
    });

    it('dragMove should change previewDimensions for selected anchor when shift down is false', () => {
        const event = {} as CdkDragMove;
        service.isShiftDown = false;
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
        service['bindResizingHandlers']();
        service['bindShiftHandlers']();
        const updateSpy = spyOn<any>(service, 'updatePreviewDimensions').and.callThrough();
        const nAnchors = 8;
        for (let i = 0; i < nAnchors; i++) {
            service.dragMove(event, i);
        }
        expect(updateSpy).toHaveBeenCalled();
    });
});
