import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { PencilService } from '@app/services/tools/pencil/pencil-service';

@Component({
    selector: 'app-pencil',
    templateUrl: './pencil.component.html',
    styleUrls: ['./pencil.component.scss'],
})
export class PencilComponent {
    minLineThickness: number;
    maxLineThickness: number;
    lineThickness: number;

    constructor(public pencilService: PencilService) {
        this.minLineThickness = MIN_LINE_THICKNESS;
        this.maxLineThickness = MAX_LINE_THICKNESS;
        this.lineThickness = this.pencilService.thickness;
    }

    onSliderChange(newThickness: number): void {
        this.pencilService.thickness = newThickness;
        this.lineThickness = this.pencilService.thickness;
    }
}
