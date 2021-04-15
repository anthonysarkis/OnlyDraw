import { Injectable } from '@angular/core';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { MathService } from '@app/services/math/math.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle-service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { SelectionShapeService } from '@app/services/tools/selection/selection-shape/selection-shape.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionRectangleService extends SelectionShapeService {
    constructor(
        protected drawingService: DrawingService,
        protected rectangleService: RectangleService,
        public selectionService: SelectionService,
        protected undoRedoService: UndoRedoService,
        protected imageService: ImageHelperService,
        protected mathService: MathService,
        public clipboardService: ClipboardService,
    ) {
        super(drawingService, rectangleService, selectionService, imageService, mathService, clipboardService);
        this.name = ToolNames.SelectionRectangle;
        this.key = ToolKeys.SelectionRectangle;
    }
}
