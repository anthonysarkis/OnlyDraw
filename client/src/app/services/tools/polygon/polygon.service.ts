import { Injectable } from '@angular/core';
import { DEFAULT_NUMBER_OF_SIDES, MAX_NUMBER_OF_SIDES, MIN_NUMBER_OF_SIDES } from '@app/classes/constants';
import { Polygon } from '@app/classes/shapes/polygon';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends ShapeService {
    private sidesCount: number;

    constructor(protected drawingService: DrawingService, private mathService: MathService) {
        super(drawingService);
        this.sidesCount = DEFAULT_NUMBER_OF_SIDES;
        this.mainShape = new Polygon(0, 0, this.sidesCount, this.mathService);
        this.alternateShape = new Polygon(0, 0, this.sidesCount, this.mathService);
        this.name = ToolNames.Polygon;
        this.key = ToolKeys.Polygon;
    }

    get numberOfSides(): number {
        return this.sidesCount;
    }

    set numberOfSides(newNumber: number) {
        this.sidesCount = Math.min(Math.max(MIN_NUMBER_OF_SIDES, newNumber), MAX_NUMBER_OF_SIDES);
        this.mainShape = new Polygon(0, 0, this.sidesCount, this.mathService);
        this.alternateShape = new Polygon(0, 0, this.sidesCount, this.mathService);
    }
}
