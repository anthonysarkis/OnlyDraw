import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_LINE_THICKNESS } from '@app/classes/constants';
import { ClipboardKeys } from '@app/enums/clipboard-keys';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { LineService } from '@app/services/tools/line/line.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SelectionPolygonService } from './selection-polygon.service';

// tslint:disable: no-string-literal

describe('SelectionPolygonService', () => {
    let service: SelectionPolygonService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    let imageHelperSpy: jasmine.SpyObj<ImageHelperService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSlideToggleModule, FormsModule],
        });
        service = TestBed.inject(SelectionPolygonService);
        canvasTestHelper = new CanvasTestHelper();
        imageHelperSpy = jasmine.createSpyObj('ImageHelperServe', ['drawOnBaseCtx', 'getSelectedImage', 'getClippedImage']);
        lineServiceSpy = jasmine.createSpyObj('LineService', ['onMouseDown', 'onMouseUp', 'onMouseMove', 'endDrawing', 'onKeyUp', 'onKeyDown']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            'endDrawing',
            'initializeImage',
            'setDimensions',
            'setCorners',
            'updateAnchorPositions',
        ]);
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['lineService'] = lineServiceSpy;
        service['imageService'] = imageHelperSpy;
        service['selectionService'] = selectionServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    // tslint:disable: no-any

    it('onMouseUp should call clicked outside', () => {
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        const spy = spyOn<any>(service, 'clickedOutside');
        service.onMouseUp(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown should call a lot of things lol', () => {
        const keyboardEvent = {
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        const spy = spyOn<any>(service, 'drawInvalidRetroaction');
        service.mouseDown = true;
        service['selectionService'].isSelected = false;
        service['isInvalidSegment'] = true;
        service.onKeyDown(keyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyUp should call a lot of things lol', () => {
        const keyboardEvent = {
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        const spy = spyOn<any>(service, 'drawInvalidRetroaction');
        service['selectionService'].isSelected = false;
        service['isInvalidSegment'] = true;
        service.onKeyUp(keyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('checkMaxCoord should give the max coordination', () => {
        const point = { x: 3, y: 6 };
        const maxCoords = { x: 1, y: 2 };
        service['checkMaxCoord'](point, maxCoords);
        expect(maxCoords).toEqual(point);
    });

    it('checkMinCoord should give the min coordination', () => {
        const point = { x: 3, y: 6 };
        const minCoords = { x: 5, y: 8 };
        service['checkMinCoord'](point, minCoords);
        expect(minCoords).toEqual(minCoords);
    });

    it('createSelection should create a selection', () => {
        const spyClear = spyOn<any>(service['drawingService'], 'clearCanvas');
        const spyImage = spyOn<any>(service, 'makeImage');
        service['lineService'].pathData = [{ x: 0, y: 0 }];
        service['createSelection']();
        expect(spyClear).toHaveBeenCalled();
        expect(spyImage).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should delete', () => {
        const spy = spyOn<any>(service['clipboard'], 'delete');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Delete,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should cut', () => {
        const spy = spyOn<any>(service['clipboard'], 'cut');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Cut,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should not cut', () => {
        const spy = spyOn<any>(service['clipboard'], 'cut');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Cut,
            ctrlKey: false,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onClipboardKeyDown should copy', () => {
        const spy = spyOn<any>(service['clipboard'], 'copy');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Copy,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should paste', () => {
        const spy = spyOn<any>(service['clipboard'], 'paste');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Paste,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('endDrawing should end the drawing', () => {
        service.endDrawing();
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#ff0000');
    });

    it('expect line width to equal default', () => {
        service.initializeProperties();
        expect(service['drawingService'].previewCtx.lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
    });

    it('expect drawInvalidRetroaction to draw', () => {
        const spy = spyOn<any>(service['drawingService'].previewCtx, 'drawImage');
        service.drawInvalidRetroaction({ x: 0, y: 0 });
        expect(spy).toHaveBeenCalled();
    });

    it('expect intersect to be false', () => {
        const returnValue = service['intersect']({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 });
        expect(returnValue).toBeFalsy();
    });

    it('expect intersect to be false', () => {
        const returnValue = service['intersect']({ x: 3, y: 5 }, { x: 2, y: 1 }, { x: 4, y: 5 }, { x: 5, y: 8 });
        expect(returnValue).toBeFalsy();
    });

    it('expect intersect to be true', () => {
        const returnValue = service['intersect']({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 });
        expect(returnValue).toBeTruthy();
    });

    it('expect checkIfSameSlope to be false', () => {
        spyOn<any>(service, 'checkIfInsideLineSegment');
        service['lineService'].pathData = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        expect(service['checkIfSameSlope']({ x: 0, y: 0 })).toEqual(false);
    });

    it('expect checkIfSameSlope to be true', () => {
        spyOn<any>(service, 'checkIfInsideLineSegment').and.callFake(() => {
            return true;
        });
        service['lineService'].pathData = [
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
        ];
        expect(service['checkIfSameSlope']({ x: 0, y: 2 })).toBeTruthy();
    });

    it('expect checkIfInsideLineSegment to be false', () => {
        const returnValue = service['checkIfInsideLineSegment']({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 });
        expect(returnValue).toBeFalsy();
    });

    it('expect checkIfInsideLineSegment to be true', () => {
        const line1 = { x: 2, y: 4 };
        const line2 = { x: 4, y: 1 };
        const point = { x: 0, y: 0 };
        const L2 = (line2.x - line1.x) * (line2.x - line1.x) + (line2.y - line1.y) * (line2.y - line1.y);
        const r = ((point.x - line1.x) * (line2.x - line1.x) + (point.y - line1.y) * (line2.y - line1.y)) / L2;
        const returnValue = service['checkIfInsideLineSegment'](line1, line2, point);
        expect(returnValue).toEqual(0 <= r && r <= 1);
    });

    it('expect clickedOutside to be true', () => {
        service['selectionService'].isSelected = true;
        service.mouseDown = false;
        service['selectionService'].mouseDown = false;
        const spy = spyOn<any>(service, 'cancelSelection');
        service['clickedOutside'](mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('expect clickedOutside to be false', () => {
        service['selectionService'].isSelected = false;
        const returnValue = service['clickedOutside'](mouseEvent);
        expect(returnValue).toBeFalsy();
    });

    it('onMouseDown should call lineService mouseDown', () => {
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        lineServiceSpy.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 1 },
        ];
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(lineServiceSpy.onMouseDown).toHaveBeenCalled();
        expect(lineServiceSpy.endDrawing).toHaveBeenCalled();
    });

    it('onMouseDown should not call lineService mouseDown', () => {
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        lineServiceSpy.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 1 },
        ];
        service['isInvalidSegment'] = true;
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(lineServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('onMouseDown should call lineService mouseDown', () => {
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        lineServiceSpy.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 1 },
        ];
        service['lineService'].pathData.length = 1;
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(lineServiceSpy.onMouseDown).toHaveBeenCalled();
    });
    it('onMouseDown should call cancel selection', () => {
        service['selectionService'].isSelected = true;
        const spy = spyOn<any>(service, 'cancelSelection');
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it('onMouseMove should call onMouseMove from line service', () => {
        mouseEvent = {
            offsetX: 0,
            offsetY: 0.5,
            button: MouseButton.Left,
        } as MouseEvent;
        lineServiceSpy.pathData = [
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 0 },
        ];
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(lineServiceSpy.onMouseMove).toHaveBeenCalled();
    });
    it('cancelSelection cancels selection', () => {
        const spy = spyOn<any>(service['drawingService'].previewCtx, 'setLineDash');
        mouseEvent = ({
            preventDefault(): void {
                return;
            },
            target: { className: 'emak' },
        } as unknown) as MouseEvent;
        service['cancelSelection'](mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
});
