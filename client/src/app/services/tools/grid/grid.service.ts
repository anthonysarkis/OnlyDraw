import { Injectable } from '@angular/core';
import { DECREMENT_SIZE, DEFAULT_SQUARE_SIZE, INCREMENT_SIZE, MAX_SQUARE_SIZE, MIN_OPACITY, MIN_SQUARE_SIZE } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    canvas: HTMLCanvasElement;
    gridCtx: CanvasRenderingContext2D;
    squareSize: number;
    showGrid: boolean;
    private gridOpacity: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.name = ToolNames.Grid;
        this.key = ToolKeys.Grid;
        this.squareSize = DEFAULT_SQUARE_SIZE;
        this.showGrid = false;
        this.gridOpacity = 1;
    }

    get opacity(): number {
        return this.gridOpacity;
    }

    set opacity(newOpacity: number) {
        this.gridOpacity = Math.min(Math.max(MIN_OPACITY, newOpacity), 1);
    }

    toggleGrid(): void {
        if (this.showGrid) this.clearGrid();
        this.showGrid = !this.showGrid;
        this.drawGrid();
    }

    onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        if (!this.showGrid) return;
        if (event.key === '=' || event.key === '+') this.changeSquareSize(INCREMENT_SIZE);
        if (event.key === '-' || event.key === '_') this.changeSquareSize(DECREMENT_SIZE);
    }

    drawGrid(): void {
        if (!this.showGrid) return;
        this.gridCtx.globalAlpha = this.opacity;
        this.drawColumns();
        this.drawRows();
    }

    clearGrid(): void {
        this.gridCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawColumns(): void {
        for (let i = 0; i < this.canvas.width; i += this.squareSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(i, 0);
            this.gridCtx.lineTo(i, this.canvas.height);
            this.gridCtx.stroke();
            this.gridCtx.closePath();
        }
    }

    private drawRows(): void {
        for (let i = 0; i < this.canvas.height; i += this.squareSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, i);
            this.gridCtx.lineTo(this.canvas.width, i);
            this.gridCtx.stroke();
            this.gridCtx.closePath();
        }
    }

    private changeSquareSize(incrementSize: number): void {
        const newSize = this.squareSize + incrementSize;
        this.squareSize = Math.min(Math.max(MIN_SQUARE_SIZE, newSize), MAX_SQUARE_SIZE);
        this.clearGrid();
        this.drawGrid();
    }
}
