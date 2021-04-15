import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CANVAS_NAME, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ToolNames } from '@app/enums/tools-names';
import { Dimensions } from '@app/interfaces/dimensions';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnDestroy {
    @ViewChild('baseCanvas', { static: false }) private baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) private previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) private gridCanvas: ElementRef<HTMLCanvasElement>;
    private canvasImage: ImageData;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;

    currentTool: Tool;
    toolSubscription: Subscription;
    isCursorNone: boolean;

    constructor(private drawingService: DrawingService, private toolsService: ToolsService, private gridService: GridService) {
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.isCursorNone = false;
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.gridService.gridCtx = this.gridCtx;
        this.gridService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.initializeColor();
        this.drawingService.fillCanvasWhite(this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.initializeTool();

        setTimeout(() => {
            if (localStorage.getItem(CANVAS_NAME)) {
                this.drawingService.loadCanvas();
                this.currentTool.initializeProperties();
            }
        });
    }

    get width(): number {
        return this.canvasSize.x;
    }

    @Input() set width(newWidth: number) {
        if (!this.drawingService.baseCtx) return;
        this.saveAndResizeCanvas({ width: newWidth, height: this.height });
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @Input() set height(newHeight: number) {
        if (!this.drawingService.baseCtx) return;
        this.saveAndResizeCanvas({ width: this.width, height: newHeight });
    }

    saveAndResizeCanvas(dimensions: Dimensions): void {
        if (this.currentTool) this.currentTool.endDrawing();
        this.canvasImage = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.canvasSize = { x: dimensions.width, y: dimensions.height };
        setTimeout(() => {
            if (this.gridService.showGrid) this.gridService.drawGrid();
            this.drawingService.fillCanvasWhite(this.width, this.height);
            this.drawingService.baseCtx.putImageData(this.canvasImage, 0, 0);
            this.currentTool.initializeProperties();
            this.drawingService.initializeColor();
            setTimeout(() => {
                this.drawingService.saveCanvas();
            });
        });
    }

    setIsCursorNone(): void {
        this.isCursorNone = false;
        if (this.currentTool.name === ToolNames.Eraser || this.currentTool.name === ToolNames.Stamp) this.isCursorNone = true;
    }

    private initializeTool(): void {
        this.toolSubscription = this.toolsService.selectedTool.subscribe((selectedTool) => {
            this.currentTool = selectedTool;
            this.currentTool.initializeProperties();
            this.setIsCursorNone();
        });
    }

    ngOnDestroy(): void {
        this.toolSubscription.unsubscribe();
    }
}
