import { CdkDragEnd, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { OptionPanelComponent } from '@app/components/option-panel/option-panel.component';
import { SelectionComponent } from '@app/components/selection/selection.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TextboxComponent } from '@app/components/textbox/textbox.component';
import { ClipboardComponent } from '@app/components/tools/clipboard/clipboard.component';
import { ColorPickerComponent } from '@app/components/tools/color-picker/color-picker.component';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { PencilComponent } from '@app/components/tools/pencil/pencil.component';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let canvasOperationsService: CanvasOperationsService;

    beforeEach(async(() => {
        canvasOperationsService = new CanvasOperationsService({} as UndoRedoService, {} as ImageHelperService);
        canvasOperationsService.previewDimensions = { width: 0, height: 0 };
        canvasOperationsService.canvasDimensions = { width: 0, height: 0 };
        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                MatFormFieldModule,
                MatTooltipModule,
                DragDropModule,
                MatSliderModule,
                MatSlideToggleModule,
                FormsModule,
                MatCardModule,
                MatIconModule,
            ],
            declarations: [
                EditorComponent,
                DrawingComponent,
                SidebarComponent,
                OptionPanelComponent,
                ColorPickerComponent,
                PencilComponent,
                SelectionComponent,
                ClipboardComponent,
                TextboxComponent,
                MagnetismComponent,
            ],
            providers: [{ provide: CanvasOperationsService, useValue: canvasOperationsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // tslint:disable: no-string-literal
    it('ngAfterViewInit should set the correct width and height from localStorage', () => {
        // tslint:disable: no-any
        const updateDimensionsSpy = spyOn<any>(canvasOperationsService, 'updateCanvasDimensions');
        window.localStorage.setItem('width', '0');
        window.localStorage.setItem('height', '0');
        component.ngAfterViewInit();
        expect(updateDimensionsSpy).toHaveBeenCalled();
        window.localStorage.clear();
        component.ngAfterViewInit();
        expect(updateDimensionsSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should set the correct width and height from native', () => {
        const updateDimensionsSpy = spyOn<any>(canvasOperationsService, 'updateCanvasDimensions');
        component['workspace'].nativeElement = { clientWidth: 0, clientHeight: 0 } as HTMLDivElement;
        window.localStorage.clear();
        component.ngAfterViewInit();
        expect(updateDimensionsSpy).toHaveBeenCalled();
    });

    it('should call DragEnd of CanvasOperations', () => {
        const event = {} as CdkDragEnd;
        const spy = spyOn(component.canvasService, 'dragEnd');
        component.dragEnd(event, true, true);
        expect(spy).toHaveBeenCalled();
    });

    it('should call DragMove of CanvasOperations', () => {
        const event = {} as CdkDragMove;
        const spy = spyOn(component.canvasService, 'dragMove');
        component.dragMove(event, true, true);
        expect(spy).toHaveBeenCalled();
    });
});
