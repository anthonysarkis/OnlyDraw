import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { ShapeOptions } from '@app/enums/shape-option';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';

@Component({
    selector: 'app-ellipse',
    templateUrl: './ellipse.component.html',
    styleUrls: ['./ellipse.component.scss'],
})
export class EllipseComponent {
    lineThickness: number;
    minLineThickness: number;
    maxLineThickness: number;

    constructor(public ellipseService: EllipseService) {
        this.lineThickness = this.ellipseService.lineThickness;
        this.maxLineThickness = MAX_LINE_THICKNESS;
        this.minLineThickness = MIN_LINE_THICKNESS;
    }

    onLineThicknessChange(newThickness: number): void {
        this.ellipseService.lineThickness = newThickness;
        this.lineThickness = this.ellipseService.lineThickness;
    }

    onRadioButtonChange(pressedButton: string): void {
        switch (pressedButton) {
            case ShapeOptions.Bordered: {
                this.changeServiceValues(true, false);
                break;
            }
            case ShapeOptions.Filled: {
                this.changeServiceValues(false, true);
                break;
            }
            case ShapeOptions.FilledAndBordered: {
                this.changeServiceValues(true, true);
                break;
            }
        }
    }

    private changeServiceValues(isBordered: boolean, isFilled: boolean): void {
        this.ellipseService.isBordered = isBordered;
        this.ellipseService.isFilled = isFilled;
    }
}
