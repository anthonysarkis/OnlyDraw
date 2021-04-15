import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { ShapeOptions } from '@app/enums/shape-option';
import { RectangleService } from '@app/services/tools/rectangle/rectangle-service';

@Component({
    selector: 'app-rectangle',
    templateUrl: './rectangle.component.html',
    styleUrls: ['./rectangle.component.scss'],
})
export class RectangleComponent {
    lineThickness: number;
    minLineThickness: number;
    maxLineThickness: number;

    constructor(public rectangleService: RectangleService) {
        this.lineThickness = this.rectangleService.lineThickness;
        this.maxLineThickness = MAX_LINE_THICKNESS;
        this.minLineThickness = MIN_LINE_THICKNESS;
    }

    onLineThicknessChange(newThickness: number): void {
        this.rectangleService.lineThickness = newThickness;
        this.lineThickness = this.rectangleService.lineThickness;
    }

    onRadioButtonChange(pressedButton: string): void {
        switch (pressedButton) {
            case ShapeOptions.Bordered: {
                this.changeServiceStyles(true, false);
                break;
            }
            case ShapeOptions.Filled: {
                this.changeServiceStyles(false, true);
                break;
            }
            case ShapeOptions.FilledAndBordered: {
                this.changeServiceStyles(true, true);
                break;
            }
        }
    }

    private changeServiceStyles(isBordered: boolean, isFilled: boolean): void {
        this.rectangleService.isBordered = isBordered;
        this.rectangleService.isFilled = isFilled;
    }
}
