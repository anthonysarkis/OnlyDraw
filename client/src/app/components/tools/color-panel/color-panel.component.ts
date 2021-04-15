import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { MAX_RGB, PANEL_HEIGHT, PANEL_WIDTH } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent implements AfterViewInit {
    @ViewChild('canvas') private canvas: ElementRef<HTMLCanvasElement>;

    canvasDimensions: Dimensions;
    private hueColor: Color;
    private context: CanvasRenderingContext2D;
    private mouseDown: boolean;
    private selectedPosition: Vec2;
    private currentColor: Color;

    get hue(): Color {
        return this.hueColor;
    }

    @Input() set hue(newColor: Color) {
        this.hueColor = newColor;
        this.draw();
    }

    constructor(private colorService: ColorService) {
        this.hue = this.colorService.hue;
        this.canvasDimensions = { width: PANEL_WIDTH, height: PANEL_HEIGHT };
        this.mouseDown = false;
    }

    ngAfterViewInit(): void {
        if (!this.hue) this.hue = new Color(0, 0, 0, 1);
        this.currentColor = this.hue;
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvas.nativeElement.width = this.canvasDimensions.width;
        this.canvas.nativeElement.height = this.canvasDimensions.height;
        this.selectedPosition = { x: this.canvasDimensions.width, y: 0 };
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
        this.selectedPosition = { x: event.offsetX, y: event.offsetY };
        if (event.offsetX >= this.canvas.nativeElement.width) this.selectedPosition.x = this.canvas.nativeElement.width - 1;
        if (event.offsetY >= this.canvas.nativeElement.height) this.selectedPosition.y = this.canvas.nativeElement.height - 1;
        this.currentColor = this.colorService.onMouseMove(this.selectedPosition, this.context, false);
        this.draw();
    }

    draw(): void {
        if (!this.context) return;
        this.context.fillStyle = this.hue.hex;
        this.context.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);

        const whiteGradient = this.context.createLinearGradient(0, 0, this.canvasDimensions.width, 0);
        this.drawGradient(0, whiteGradient);
        const blackGradient = this.context.createLinearGradient(0, 0, 0, this.canvasDimensions.height);
        this.drawGradient(MAX_RGB, blackGradient);

        this.context.strokeStyle = this.currentColor.hex;
        this.drawCursor();
    }

    drawGradient(rgbaValue: number, gradient: CanvasGradient): void {
        gradient.addColorStop(0, `rgba(${rgbaValue}, ${rgbaValue}, ${rgbaValue}, 1)`);
        gradient.addColorStop(1, `rgba(${rgbaValue}, ${rgbaValue}, ${rgbaValue}, 0)`);
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    }

    drawCursor(): void {
        if (!this.selectedPosition) return;
        this.context.beginPath();
        const radius = 10;
        this.context.arc(this.selectedPosition.x, this.selectedPosition.y, radius, 0, 2 * Math.PI);
        this.context.strokeStyle = 'white';
        this.context.stroke();
        this.context.closePath();
    }
}
