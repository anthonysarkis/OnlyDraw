import { Injectable } from '@angular/core';
import { Circle } from '@app/classes/shapes/circle';
import { Ellipse } from '@app/classes/shapes/ellipse';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends ShapeService {
    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.mainShape = new Ellipse(0, 0);
        this.alternateShape = new Circle(0, 0);
        this.name = ToolNames.Ellipse;
        this.key = ToolKeys.Ellipse;
    }
}
