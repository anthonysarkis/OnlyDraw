import { Injectable } from '@angular/core';
import * as Constants from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Dimensions } from '@app/interfaces/dimensions';

@Injectable({
    providedIn: 'root',
})
export class MathService {
    calculateShiftedAngle(startPosition: Vec2, mousePosition: Vec2): number {
        const piParts = 8;
        const angles: number[] = [];
        for (let i = 0; i < piParts; i++) {
            angles[i] = this.getPiAngle(i);
        }
        const deltaX = mousePosition.x - startPosition.x;
        const deltaY = startPosition.y - mousePosition.y;

        let theta = Math.atan2(deltaY, deltaX);
        if (theta < -(Math.PI / piParts)) theta += 2 * Math.PI;

        return angles.reduce((prev, curr) => {
            return Math.abs(curr - theta) < Math.abs(prev - theta) ? curr : prev;
        });
    }

    calculateShiftedPosition(startPosition: Vec2, mousePosition: Vec2, closestAngle: number): Vec2 {
        const newPosition: Vec2 = { x: startPosition.x, y: startPosition.y };
        if (closestAngle === this.getPiAngle(0) || closestAngle === this.getPiAngle(0) + Math.PI) {
            newPosition.x = mousePosition.x;
            return newPosition;
        }
        if (closestAngle === this.getPiAngle(2) || closestAngle === this.getPiAngle(2) + Math.PI) {
            newPosition.y = mousePosition.y;
            return newPosition;
        }
        newPosition.x = mousePosition.x;
        newPosition.y = Math.round(startPosition.y - Math.tan(closestAngle) * (mousePosition.x - startPosition.x));
        return newPosition;
    }

    verifyPointProximity(origin: Vec2, pointToVerify: Vec2): Vec2 {
        const xVariation = Math.abs(origin.x - pointToVerify.x);
        const yVariation = Math.abs(origin.y - pointToVerify.y);
        const distanceFromOrigin = Math.sqrt(Math.pow(xVariation, 2) + Math.pow(yVariation, 2));

        return distanceFromOrigin <= Constants.MAX_CONNECTION_DISTANCE ? origin : pointToVerify;
    }

    getPiAngle(anglePart: number): number {
        const interval = 4;
        return (anglePart * Math.PI) / interval;
    }

    swapCorners(coords: Vec2[], axis: string): void {
        axis === 'x'
            ? ([coords[Constants.START].x, coords[Constants.END].x] = [coords[Constants.END].x, coords[Constants.START].x])
            : ([coords[Constants.START].y, coords[Constants.END].y] = [coords[Constants.END].y, coords[Constants.START].y]);
    }

    absoluteDimensions(dimensions: Dimensions, width: number, height: number): void {
        dimensions.width = Math.round(Math.abs(width));
        dimensions.height = Math.round(Math.abs(height));
    }

    roundVec2(coord: Vec2): void {
        coord.x = Math.round(coord.x);
        coord.y = Math.round(coord.y);
    }

    calculateShiftedCorners(coords: Vec2[], width: number, height: number): void {
        if (coords[Constants.START].x + width > coords[Constants.END].x) coords[Constants.END].x = Math.round(coords[Constants.START].x + width);
        if (coords[Constants.START].y + height > coords[Constants.END].y) coords[Constants.END].y = Math.round(coords[Constants.START].y + height);
    }

    getCoefficient(numberOfSides: number): number {
        if (numberOfSides === Constants.MIN_NUMBER_OF_SIDES) return 1;
        if (numberOfSides >= Constants.TEN_SIDES) return Constants.TEN_SIDES_COEFFICIENT;
        return Constants.FIRST_COEFFICIENT * Math.pow(numberOfSides, 2) - Constants.SECOND_COEFFICIENT * numberOfSides + Constants.INTERCEPT;
    }

    isPointInCanvas(point: Vec2, canvasWidth: number, canvasHeight: number): boolean {
        const isPointPositive = point.x > 0 && point.y > 0;
        const isPointSmallerThanCanvas = point.x < canvasWidth && point.y < canvasHeight;
        return isPointPositive && isPointSmallerThanCanvas;
    }
}
