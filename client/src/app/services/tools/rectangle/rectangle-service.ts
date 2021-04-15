import { Injectable } from '@angular/core';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { Square } from '@app/classes/shapes/square';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends ShapeService {
    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.mainShape = new Rectangle(0, 0);
        this.alternateShape = new Square(0, 0);
        this.name = ToolNames.Rectangle;
        this.key = ToolKeys.Rectangle;
    }
}
