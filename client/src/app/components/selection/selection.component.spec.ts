import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { Anchor } from '@app/enums/drag-anchors';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/tools/selection/resize/resize.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionComponent } from './selection.component';

describe('SelectionComponent', () => {
    let component: SelectionComponent;
    let fixture: ComponentFixture<SelectionComponent>;
    let selectionSpy: jasmine.SpyObj<SelectionService>;
    let resizeSpy: jasmine.SpyObj<ResizeService>;
    let canvasTestHelper: CanvasTestHelper;
    let drawingStub: DrawingService;

    beforeEach(async(() => {
        selectionSpy = jasmine.createSpyObj('SelectionService', ['setDimensions', 'drawImage', 'clipShape', 'setCorners']);
        resizeSpy = jasmine.createSpyObj('ResizeService', ['dragMove', 'dragEnd', 'resetProperties', 'checkIfNeedsMirror']);
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        canvasTestHelper = new CanvasTestHelper();
        drawingStub.canvas = canvasTestHelper.canvas;
        drawingStub.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        selectionSpy.drawingService = drawingStub;
        TestBed.configureTestingModule({
            imports: [DragDropModule],
            declarations: [SelectionComponent],
            providers: [
                { provide: SelectionService, useValue: selectionSpy },
                { provide: ResizeService, useValue: resizeSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        selectionSpy.currentDimensions = { width: 0, height: 0 };
        selectionSpy.currentCorner = { x: 0, y: 0 };
        resizeSpy.previewDimensions = { width: 0, height: 0 };
        resizeSpy.anchors = [];
        resizeSpy.dimensions = { width: 0, height: 0 };
        resizeSpy.previewCorners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        resizeSpy.corners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        // tslint:disable:no-string-literal
        resizeSpy['selectedAnchor'] = 0;
        resizeSpy['lastPosition'] = { x: 0, y: 0 };
        const anchorNumbers = 7;
        for (let i = 0; i < anchorNumbers; i++) resizeSpy.anchors[i] = { x: 0, y: 0 };
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionComponent);
        component = fixture.componentInstance;
        component['canvas'] = new ElementRef<HTMLCanvasElement>(canvasTestHelper.selectionCanvas);
        component['previewCtx'] = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dragmove of canvas service when calling drag move from component with right params', () => {
        const cdkEvent = {} as CdkDragMove;
        selectionSpy.imageWithBorder = new Image(1, 1);
        component.dragMove(cdkEvent, 0);
        expect(resizeSpy.dragMove).toHaveBeenCalledWith(cdkEvent, 0);
    });

    it('should call dragEnd of canvas service when calling dragEnd from component and it should draw image after', fakeAsync(() => {
        selectionSpy.shape = new Rectangle(0, 0);
        component.dragEnd();
        tick();
        expect(resizeSpy.dragEnd).toHaveBeenCalledWith();
        expect(selectionSpy.drawImage).toHaveBeenCalled();
    }));

    it('should call dragEnd of canvas service when calling dragEnd while mirroX and Y are true', fakeAsync(() => {
        resizeSpy.mirrorX = true;
        resizeSpy.mirrorY = true;

        selectionSpy.shape = new Rectangle(0, 0);
        component.dragEnd();
        tick();
        expect(resizeSpy.dragEnd).toHaveBeenCalledWith();
        expect(selectionSpy.drawImage).toHaveBeenCalled();
    }));
    it('should call dragEnd of canvas service when calling dragEnd while mirroX and Y are false', fakeAsync(() => {
        resizeSpy.mirrorX = false;
        resizeSpy.mirrorY = false;

        selectionSpy.shape = new Rectangle(0, 0);
        component.dragEnd();
        tick();
        expect(resizeSpy.dragEnd).toHaveBeenCalledWith();
        expect(selectionSpy.drawImage).toHaveBeenCalled();
    }));

    it('should mirror in X only if previewXTransformation is true ', () => {
        component.previewXTransformation = true;
        component.previewYTransformation = false;
        component['applyPreviewMirror']();
        expect(component.previewXTransformation).toEqual(true);
    });

    it('should mirror in Y only if previewYTransformation is true ', () => {
        component.previewXTransformation = false;
        component.previewYTransformation = true;
        component['applyPreviewMirror']();
        expect(component.previewXTransformation).toEqual(false);
    });

    it('should mirror in X and Y only if previewXTransformation and previewYTransformation are true ', () => {
        component.previewXTransformation = true;
        component.previewYTransformation = true;
        component['applyPreviewMirror']();
        expect(component.previewXTransformation).toEqual(true);
    });

    it('should set previewXTransformation to true if not identical to service ', () => {
        component.previewXTransformation = false;
        selectionSpy.xTransformation = true;
        resizeSpy.mirrorX = false;
        component['needsXTransform']();
        component.previewXTransformation = false;
        selectionSpy.xTransformation = false;
        resizeSpy.mirrorX = true;
        component['needsXTransform']();
        expect(selectionSpy.xTransformation).toEqual(false);
    });

    it('should set previewYTransformation to true if not identical to service ', () => {
        component.previewYTransformation = false;
        selectionSpy.yTransformation = true;
        resizeSpy.mirrorY = false;
        component['needsYTransform']();
        component.previewYTransformation = false;
        selectionSpy.yTransformation = false;
        resizeSpy.mirrorY = true;
        component['needsYTransform']();
        expect(selectionSpy.yTransformation).toEqual(false);
    });

    it('dragMove should not call checkIfNeedsMirror if mirrorBindings are undefined ', () => {
        const cdkEvent = {} as CdkDragMove;
        selectionSpy.imageWithBorder = new Image(1, 1);
        resizeSpy.mirrorBindings = {} as Map<Anchor, () => void>;
        component.dragMove(cdkEvent, 0);
        expect(resizeSpy.dragMove).toHaveBeenCalledWith(cdkEvent, 0);
    });
});
