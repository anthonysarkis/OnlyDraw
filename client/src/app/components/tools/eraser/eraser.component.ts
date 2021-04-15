import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MIN_ERASER_THICKNESS } from '@app/classes/constants';
import { EraserService } from '@app/services/tools/eraser/eraser.service';

@Component({
    selector: 'app-eraser',
    templateUrl: './eraser.component.html',
    styleUrls: ['./eraser.component.scss'],
})
export class EraserComponent {
    minEraserThickness: number;
    maxEraserThickness: number;
    eraserThickness: number;

    constructor(public eraserService: EraserService) {
        this.minEraserThickness = MIN_ERASER_THICKNESS;
        this.maxEraserThickness = MAX_LINE_THICKNESS;
        this.eraserThickness = this.eraserService.thickness;
    }

    onThicknessChange(newThickness: number): void {
        this.eraserService.thickness = newThickness;
        this.eraserThickness = this.eraserService.thickness;
    }
}
