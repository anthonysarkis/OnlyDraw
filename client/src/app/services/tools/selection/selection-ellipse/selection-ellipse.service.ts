import { Injectable } from '@angular/core';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { MathService } from '@app/services/math/math.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { SelectionShapeService } from '@app/services/tools/selection/selection-shape/selection-shape.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionEllipseService extends SelectionShapeService {
    constructor(
        protected drawingService: DrawingService,
        protected ellipseService: EllipseService,
        public selectionService: SelectionService,
        protected imageService: ImageHelperService,
        protected mathService: MathService,
        public clipboardService: ClipboardService,
    ) {
        super(drawingService, ellipseService, selectionService, imageService, mathService, clipboardService);
        this.name = ToolNames.SelectionEllipse;
        this.key = ToolKeys.SelectionEllipse;
    }
}
