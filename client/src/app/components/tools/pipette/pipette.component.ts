import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
@Component({
    selector: 'app-pipette',
    templateUrl: './pipette.component.html',
    styleUrls: ['./pipette.component.scss'],
})
export class PipetteComponent implements AfterViewInit {
    @ViewChild('dropperViewer') private canvas: ElementRef<HTMLCanvasElement>;
    constructor(private pipetteService: PipetteService) {}

    ngAfterViewInit(): void {
        this.pipetteService.dropperVisualisation = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
}
