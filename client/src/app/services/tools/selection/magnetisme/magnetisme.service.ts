import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { Positions } from '@app/enums/magnetism-positions';
import { Dimensions } from '@app/interfaces/dimensions';
import { GridService } from '@app/services/tools/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetismeService {
    applyMagnet: boolean;
    selectedOption: string;
    options: Map<string, (adjustedCorner: Vec2, dimensions: Dimensions) => void>;

    constructor(public gridService: GridService) {
        this.applyMagnet = false;
        this.selectedOption = Positions.TopLeft;
        this.bindOptions();
    }

    toggleMagnet(): void {
        this.applyMagnet = !this.applyMagnet;
    }

    adjustCorner(currentCorner: Vec2, dimensions: Dimensions): Vec2 {
        if (!this.applyMagnet) return currentCorner;
        const adjustedCorner = { x: currentCorner.x, y: currentCorner.y };
        const adjustingMethod = this.options.get(this.selectedOption) as (adjustedCorner: Vec2, dimensions: Dimensions) => void;
        adjustingMethod(adjustedCorner, dimensions);
        return adjustedCorner;
    }

    jumpSquare(currentCorner: Vec2, key: string): void {
        if (key === ArrowKeys.Right) currentCorner.x += this.gridService.squareSize;
        if (key === ArrowKeys.Left) currentCorner.x -= this.gridService.squareSize;
        if (key === ArrowKeys.Up) currentCorner.y -= this.gridService.squareSize;
        if (key === ArrowKeys.Down) currentCorner.y += this.gridService.squareSize;
    }

    private bindOptions(): void {
        this.options = new Map();
        this.options.set(Positions.TopRight, (adjustedCorner, dimensions): void => {
            this.topRightHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.TopLeft, (adjustedCorner): void => {
            this.topLeftHandler(adjustedCorner);
        });
        this.options.set(Positions.TopMiddle, (adjustedCorner, dimensions): void => {
            this.topMiddleHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.Middle, (adjustedCorner, dimensions) => {
            this.middleHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.MiddleLeft, (adjustedCorner, dimensions) => {
            this.middleLeftHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.MiddleRight, (adjustedCorner, dimensions) => {
            this.middleRightHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.BottomRight, (adjustedCorner, dimensions) => {
            this.bottomRightHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.BottomLeft, (adjustedCorner, dimensions) => {
            this.bottomLeftHandler(adjustedCorner, dimensions);
        });
        this.options.set(Positions.BottomMiddle, (adjustedCorner, dimensions) => {
            this.bottomMiddleHandler(adjustedCorner, dimensions);
        });
    }

    private topLeftHandler(adjustedCorner: Vec2): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x, y: adjustedCorner.y });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: 0, height: 0 });
    }

    private topRightHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width, y: adjustedCorner.y });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width, height: 0 });
    }

    private topMiddleHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width / 2, y: adjustedCorner.y });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width / 2, height: 0 });
    }

    private middleLeftHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x, y: adjustedCorner.y + dimensions.height / 2 });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: 0, height: -dimensions.height / 2 });
    }

    private middleRightHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width, y: adjustedCorner.y + dimensions.height / 2 });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width, height: -dimensions.height / 2 });
    }

    private middleHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width / 2, y: adjustedCorner.y + dimensions.height / 2 });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width / 2, height: -dimensions.height / 2 });
    }

    private bottomRightHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width, y: adjustedCorner.y + dimensions.height });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width, height: -dimensions.height });
    }

    private bottomMiddleHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x + dimensions.width / 2, y: adjustedCorner.y + dimensions.height });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: -dimensions.width / 2, height: -dimensions.height });
    }

    private bottomLeftHandler(adjustedCorner: Vec2, dimensions: Dimensions): void {
        const factors: Vec2 = this.calculateFactors({ x: adjustedCorner.x, y: adjustedCorner.y + dimensions.height });
        this.calculateCorners(adjustedCorner, { x: factors.x, y: factors.y }, { width: 0, height: -dimensions.height });
    }

    private calculateFactors(corner: Vec2): Vec2 {
        return { x: Math.round(corner.x / this.gridService.squareSize), y: Math.round(corner.y / this.gridService.squareSize) };
    }

    private calculateCorners(corner: Vec2, factors: Vec2, dimensions: Dimensions): void {
        corner.x = factors.x * this.gridService.squareSize + dimensions.width;
        corner.y = factors.y * this.gridService.squareSize + dimensions.height;
    }
}
