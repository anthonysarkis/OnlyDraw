import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BehaviorSubject } from 'rxjs';
import { AerosolService } from './aerosol/aerosol.service';
import { BucketService } from './bucket/bucket.service';
import { EllipseService } from './ellipse/ellipse.service';
import { EraserService } from './eraser/eraser.service';
import { GridService } from './grid/grid.service';
import { LineService } from './line/line.service';
import { PencilService } from './pencil/pencil-service';
import { PipetteService } from './pipette/pipette.service';
import { PolygonService } from './polygon/polygon.service';
import { RectangleService } from './rectangle/rectangle-service';
import { SelectionEllipseService } from './selection/selection-ellipse/selection-ellipse.service';
import { SelectionPolygonService } from './selection/selection-polygon/selection-polygon.service';
import { SelectionRectangleService } from './selection/selection-rectangle/selection-rectangle.service';
import { StampService } from './stamp/stamp.service';
import { TextService } from './text/text.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    tools: Tool[];
    selectedTool: BehaviorSubject<Tool>;

    constructor(
        pencilService: PencilService,
        eraserService: EraserService,
        ellipseService: EllipseService,
        lineService: LineService,
        rectangleService: RectangleService,
        aerosolService: AerosolService,
        bucketService: BucketService,
        pipetteService: PipetteService,
        stampService: StampService,
        textService: TextService,
        polygonService: PolygonService,
        selectionRectangleService: SelectionRectangleService,
        selectionEllipseService: SelectionEllipseService,
        selectionPolygonService: SelectionPolygonService,
        gridService: GridService,
    ) {
        this.tools = [
            pencilService,
            eraserService,
            rectangleService,
            ellipseService,
            polygonService,
            lineService,
            aerosolService,
            bucketService,
            stampService,
            textService,
            pipetteService,
            gridService,
            selectionRectangleService,
            selectionEllipseService,
            selectionPolygonService,
        ];
        this.selectedTool = new BehaviorSubject(this.tools[0]);
    }

    selectTool(tool: Tool): void {
        this.selectedTool.value.endDrawing();
        this.selectedTool.next(tool);
    }

    selectToolByName(toolName: string): void {
        const selectedTool = this.tools.find((tool: Tool) => tool.name === toolName) as Tool;
        this.selectTool(selectedTool);
    }
}
