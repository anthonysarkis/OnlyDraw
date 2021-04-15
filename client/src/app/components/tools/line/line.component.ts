import { Component } from '@angular/core';
import { MAX_LINE_THICKNESS, MAX_POINT_DIAMETER, MIN_LINE_THICKNESS, MIN_POINT_DIAMETER } from '@app/classes/constants';
import { LineService } from '@app/services/tools/line/line.service';

@Component({
    selector: 'app-line',
    templateUrl: './line.component.html',
    styleUrls: ['./line.component.scss'],
})
export class LineComponent {
    minLineThickness: number;
    maxLineThickness: number;
    maxPointDiameter: number;

    lineThickness: number;
    pointDiameter: number;
    showJunctionPoints: boolean;
    minPointDiameter: number;

    constructor(public lineService: LineService) {
        this.minLineThickness = MIN_LINE_THICKNESS;
        this.maxLineThickness = MAX_LINE_THICKNESS;
        this.lineThickness = this.lineService.lineThickness;

        this.minPointDiameter = MIN_POINT_DIAMETER;
        this.maxPointDiameter = MAX_POINT_DIAMETER;
        this.pointDiameter = this.lineService.pointDiameter;

        this.showJunctionPoints = this.lineService.showJunctionPoints;
    }

    onLineThicknessChange(newThickness: number): void {
        this.lineService.lineThickness = newThickness;
    }

    onShowJunctionPointsChange(value: boolean): void {
        this.lineService.showJunctionPoints = value;
    }

    onPointDiameterChange(newDiameter: number): void {
        this.lineService.pointDiameter = newDiameter;
    }
}
