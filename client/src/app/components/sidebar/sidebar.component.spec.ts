import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Tool } from '@app/classes/tool';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let toolsService: ToolsService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'resetCanvas',
            'clearCanvas',
            'openExportDialog',
            'openSaveDialog',
            'openCarouselDialog',
        ]);
        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatTooltipModule, MatSlideToggleModule, BrowserAnimationsModule, MatIconModule],
            declarations: [SidebarComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        toolsService = TestBed.inject(ToolsService);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSelectTool should set tool correctly if mouse isnt down', () => {
        const lineTool: LineService = TestBed.inject(LineService);
        // tslint:disable: no-any
        const spyEnd = spyOn<any>(component.toolService.selectedTool.value, 'endDrawing');
        component.onSelectTool(lineTool);
        toolsService.selectedTool.subscribe((tool) => {
            expect(tool).toEqual(lineTool);
        });
        expect(spyEnd).toHaveBeenCalled();
    });

    it('onSelectTool should change tool if mouse is down', () => {
        const selectSpy = spyOn<any>(toolsService, 'selectTool');
        const lineTool: LineService = TestBed.inject(LineService);
        component.toolService.selectedTool.value.mouseDown = true;
        component.onSelectTool(lineTool);
        expect(selectSpy).toHaveBeenCalled();
    });

    it('onResetCanvas should call reset canvas', () => {
        component.onResetCanvas();
        expect(drawingServiceSpy.resetCanvas).toHaveBeenCalled();
    });

    it('dialogs should open with the right function calls', () => {
        component.openExportCanvas();
        component.openSaveDialog();
        component.openCarousel();
        expect(drawingServiceSpy.openExportDialog).toHaveBeenCalled();
        expect(drawingServiceSpy.openSaveDialog).toHaveBeenCalled();
        expect(drawingServiceSpy.openCarouselDialog).toHaveBeenCalled();
    });

    it('should call select all of selection service when selectAll is called', () => {
        const spy = spyOn<any>(component.selectionService, 'selectAll');
        component.selectAll();
        expect(spy).toHaveBeenCalled();
    });

    it('onUndoRedo should call redo if redo and undo if undo', () => {
        const spyRedo = spyOn<any>(component.undoRedoService, 'redo');
        const spyUndo = spyOn<any>(component.undoRedoService, 'undo');
        component.onUndoRedo(true);
        expect(spyUndo).toHaveBeenCalled();
        component.onUndoRedo(false);
        expect(spyRedo).toHaveBeenCalled();
    });

    it('should call select all of selection service when selectAll is called', () => {
        const spy = spyOn<any>(component.selectionService, 'selectAll');
        component.onSelectTool({ name: ToolNames.SelectionRectangle } as Tool);
        component.selectAll();
        expect(spy).toHaveBeenCalled();
    });
});
