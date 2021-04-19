import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CANVAS_NAME, DRAWING_DELAY } from '@app/classes/constants';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    isDark: boolean;
    borderColor: string;
    selected: boolean;
    isMusicShown: boolean;

    @ViewChild('workspace') private workspace: ElementRef<HTMLDivElement>;

    constructor(private cd: ChangeDetectorRef, public canvasService: CanvasOperationsService, private toolsService: ToolsService) {
        this.borderColor = 'black';
        this.selected = false;
        this.isDark = false;
        this.isMusicShown = false;
    }

    ngAfterViewInit(): void {
        this.setDimensions();
        if (!localStorage.getItem(CANVAS_NAME)) {
            setTimeout(() => {
                localStorage.clear();
            }, DRAWING_DELAY);
        }
        this.cd.detectChanges();
    }

    setDimensions(): void {
        this.canvasService.defaultDimensions.width = this.workspace.nativeElement.clientWidth / 2;
        this.canvasService.defaultDimensions.height = this.workspace.nativeElement.clientHeight / 2;
        let width = parseInt(localStorage.getItem('width') as string, 10);
        let height = parseInt(localStorage.getItem('height') as string, 10);
        width = width ? width : this.workspace.nativeElement.clientWidth / 2;
        height = height ? height : this.workspace.nativeElement.clientHeight / 2;
        this.canvasService.updateCanvasDimensions(width, height);
    }

    dragMove(event: CdkDragMove, isYAxis: boolean, isXAxis: boolean): void {
        this.toolsService.selectedTool.getValue().endDrawing();
        this.selected = true;
        this.borderColor = 'red';
        this.canvasService.dragMove(event, isYAxis, isXAxis);
    }

    dragEnd(event: CdkDragEnd, isYAxis: boolean, isXAxis: boolean): void {
        this.selected = false;
        this.borderColor = 'black';
        this.canvasService.dragEnd(event, isYAxis, isXAxis);
    }
}
