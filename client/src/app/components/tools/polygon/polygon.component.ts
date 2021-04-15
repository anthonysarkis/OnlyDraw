import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MAX_NUMBER_OF_SIDES, MIN_LINE_THICKNESS, MIN_NUMBER_OF_SIDES } from '@app/classes/constants';
import { ShapeOptions } from '@app/enums/shape-option';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';

@Component({
    selector: 'app-polygon',
    templateUrl: './polygon.component.html',
    styleUrls: ['./polygon.component.scss'],
})
export class PolygonComponent {
    lineThickness: number;
    minLineThickness: number;
    maxLineThickness: number;

    numberOfSides: number;
    minNumberOfSides: number;
    maxNumberOfSides: number;

    constructor(public polygonService: PolygonService) {
        this.lineThickness = this.polygonService.lineThickness;
        this.maxLineThickness = MAX_LINE_THICKNESS;
        this.minLineThickness = MIN_LINE_THICKNESS;

        this.numberOfSides = this.polygonService.numberOfSides;
        this.maxNumberOfSides = MAX_NUMBER_OF_SIDES;
        this.minNumberOfSides = MIN_NUMBER_OF_SIDES;
    }

    onLineThicknessChange(newThickness: number): void {
        this.polygonService.lineThickness = newThickness;
        this.lineThickness = this.polygonService.lineThickness;
    }

    onNumberOfSidesChange(newNumber: number): void {
        this.polygonService.numberOfSides = newNumber;
        this.numberOfSides = this.polygonService.numberOfSides;
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
        this.polygonService.isBordered = isBordered;
        this.polygonService.isFilled = isFilled;
    }
}
