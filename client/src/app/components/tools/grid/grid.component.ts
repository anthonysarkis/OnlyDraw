import { Component } from '@angular/core';
import { MAX_SQUARE_SIZE, MIN_OPACITY, MIN_SQUARE_SIZE } from '@app/classes/constants';
import { GridService } from '@app/services/tools/grid/grid.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    minSquareSize: number;
    maxSquareSize: number;
    minOpacity: number;

    constructor(public gridService: GridService) {
        this.minSquareSize = MIN_SQUARE_SIZE;
        this.maxSquareSize = MAX_SQUARE_SIZE;
        this.minOpacity = MIN_OPACITY;
    }

    onShowGrid(value: boolean): void {
        this.gridService.showGrid = value;
        if (this.gridService.showGrid) this.gridService.drawGrid();
        else this.gridService.clearGrid();
    }

    onGridChange(): void {
        this.gridService.clearGrid();
        this.gridService.drawGrid();
    }

    onOpacityChange(newOpacity: number): void {
        this.gridService.opacity = newOpacity;
        this.onGridChange();
    }
}
