import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { MAX_RGB, SLIDER_HEIGHT, SLIDER_WIDTH } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';
import { ColorService } from '@app/services/color/color.service';
@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('slider', { static: false }) private canvas: ElementRef<HTMLCanvasElement>;

    canvasDimensions: Dimensions;
    private context: CanvasRenderingContext2D;
    private mouseDown: boolean;
    private selectedWidth: number;
    private hueColor: Color;
    private colorGradients: Color[];

    constructor(private colorService: ColorService) {
        this.canvasDimensions = { width: SLIDER_WIDTH, height: SLIDER_HEIGHT };
        this.mouseDown = false;
        this.selectedWidth = 0;
        this.colorGradients = [
            new Color(MAX_RGB, 0, 0, 1),
            new Color(MAX_RGB, MAX_RGB, 0, 1),
            new Color(0, MAX_RGB, 0, 1),
            new Color(0, MAX_RGB, MAX_RGB, 1),
            new Color(0, 0, MAX_RGB, 1),
            new Color(MAX_RGB, 0, MAX_RGB, 1),
            new Color(MAX_RGB, 0, 0, 1),
        ];
    }

    ngAfterViewInit(): void {
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvas.nativeElement.width = this.canvasDimensions.width;
        this.canvas.nativeElement.height = this.canvasDimensions.height;
        this.draw();
    }

    @HostListener('window:mouseup')
    onMouseUp(): void {
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        this.onMouseMove(event);
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.selectedWidth = event.offsetX;
        const position: Vec2 = { x: this.selectedWidth, y: 0 };
        this.hueColor = this.colorService.onMouseMove(position, this.context, true);
        this.draw();
    }

    draw(): void {
        this.context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);

        const gradient = this.context.createLinearGradient(0, 0, this.canvasDimensions.width, 0);
        this.colorGradients.forEach((color, index) => {
            gradient.addColorStop(index / (this.colorGradients.length - 1), color.getRgb());
        });

        this.drawGradient(gradient);
        this.drawCursor();
    }

    drawGradient(gradient: CanvasGradient): void {
        this.context.beginPath();
        this.context.rect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.context.closePath();
    }

    drawCursor(): void {
        if (!this.selectedWidth) return;
        this.context.beginPath();
        const radiusDivider = 3;
        this.context.arc(this.selectedWidth, this.canvasDimensions.height / 2, this.canvasDimensions.height / radiusDivider, 0, 2 * Math.PI);
        this.context.fillStyle = this.hueColor.hex;
        this.context.strokeStyle = 'white';
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    }
}
