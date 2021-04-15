import { TestBed } from '@angular/core/testing';
import { FIRST_COEFFICIENT, INTERCEPT, MIN_NUMBER_OF_SIDES, SECOND_COEFFICIENT, TEN_SIDES, TEN_SIDES_COEFFICIENT } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { MathService } from './math.service';

describe('MathService', () => {
    let service: MathService;
    let startPosition: Vec2;
    const piInterval = 4;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MathService);
        startPosition = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('calculateShiftedAngle should return the correct angle', () => {
        const xAxisPosition = { x: 5, y: 0 };
        expect(service.calculateShiftedAngle(startPosition, xAxisPosition)).toEqual(0);

        const firstQuadrantPosition = { x: 5, y: -5 };
        expect(service.calculateShiftedAngle(startPosition, firstQuadrantPosition)).toEqual(Math.PI / piInterval);

        const yAxisPosition = { x: 0, y: -5 };
        expect(service.calculateShiftedAngle(startPosition, yAxisPosition)).toEqual(Math.PI / 2);

        const fourthQuadrantPosition = { x: 5, y: 5 };
        const piPosition = 7;
        expect(service.calculateShiftedAngle(startPosition, fourthQuadrantPosition)).toEqual((piPosition * Math.PI) / piInterval);
    });

    it('calculateShiftedAngle should return the correct angle when close to 360 degrees', () => {
        const position = { x: 5, y: 2 };
        expect(service.calculateShiftedAngle(startPosition, position)).toEqual(0);
    });

    it('calculateShiftedPosition should return the correct position when close to the y axis', () => {
        const mousePosition = { x: 0, y: 5 };
        const closestAngle = Math.PI / 2;
        const newPosition = service.calculateShiftedPosition(startPosition, mousePosition, closestAngle);
        expect(newPosition.x).toBe(startPosition.x);
        expect(newPosition.y).toBe(mousePosition.y);
    });

    it('calculateShiftedPosition should return the correct position when close to the x axis', () => {
        const mousePosition = { x: 5, y: 0 };
        const closestAngle = 0;
        const newPosition = service.calculateShiftedPosition(startPosition, mousePosition, closestAngle);
        expect(newPosition.x).toBe(mousePosition.x);
        expect(newPosition.y).toBe(startPosition.y);
    });

    it('calculateShiftedPosition should return the correct position when close to the horizontal 135-315 degree axis', () => {
        const mousePosition = { x: 5, y: 5 };
        const piPosition = 3;
        const closestAngle = (piPosition * Math.PI) / piInterval;
        const newPosition = service.calculateShiftedPosition(startPosition, mousePosition, closestAngle);
        expect(newPosition.x).toBe(mousePosition.x);
        expect(newPosition.y).toBe(mousePosition.y);
    });

    it('calculateShiftedPosition should return the correct position when close to the 45-225 axis', () => {
        const mousePosition = { x: 5, y: -5 };
        const closestAngle = Math.PI / piInterval;
        const newPosition = service.calculateShiftedPosition(startPosition, mousePosition, closestAngle);
        expect(newPosition.x).toBe(mousePosition.x);
        expect(newPosition.y).toBe(mousePosition.y);
    });

    it('verifyPointProximity should return the origin if the distance is less than 20px', () => {
        const pointToVerify = { x: 10, y: 10 };
        expect(service.verifyPointProximity(startPosition, pointToVerify)).toEqual(startPosition);
    });

    it('verifyPointProximity should return the current point if the distance is greater than 20px', () => {
        const pointToVerify = { x: 100, y: 100 };
        expect(service.verifyPointProximity(startPosition, pointToVerify)).toEqual(pointToVerify);
    });

    it('swap corners should swap x values if x axis', () => {
        const coords = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service.swapCorners(coords, 'x');
        expect(coords[0].x).toEqual(0);
    });

    it('swap corners should swap x values if y axis', () => {
        const coords = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service.swapCorners(coords, 'y');
        expect(coords[0].y).toEqual(0);
    });

    it('absolute dimensions should assign positive dimensions', () => {
        const dimensions = { width: -1, height: -1 };
        service.absoluteDimensions(dimensions, 1, 1);
        expect(dimensions.width).toEqual(1);
        expect(dimensions.height).toEqual(1);
    });

    it('round vec2 should round values', () => {
        const dimensions = { x: 1.1, y: 1.1 };
        service.roundVec2(dimensions);
        expect(dimensions.x).toEqual(1);
        expect(dimensions.y).toEqual(1);
    });

    it('calculate shifted corners should set the right corners positions if last coords are smaller', () => {
        const coords = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service.calculateShiftedCorners(coords, 1, 1);
        const shiftedPosition = 3;
        expect(coords[1].x).toEqual(shiftedPosition);
        expect(coords[1].y).toEqual(shiftedPosition);
    });

    it('calculate shifted corners should set the right corners positions if last coords are higher', () => {
        const coords = [
            { x: 0, y: 0 },
            { x: 2, y: 2 },
        ];
        service.calculateShiftedCorners(coords, 1, 1);
        expect(coords[1].x).toEqual(2);
        expect(coords[1].y).toEqual(2);
    });

    it('getCoefficient should return 1 if numberOfSides is 3', () => {
        expect(service.getCoefficient(MIN_NUMBER_OF_SIDES)).toBe(1);
        expect(service.getCoefficient(TEN_SIDES)).toBe(TEN_SIDES_COEFFICIENT);
        const fourSides = 4;
        const coeff = FIRST_COEFFICIENT * fourSides * fourSides - SECOND_COEFFICIENT * fourSides + INTERCEPT;
        expect(service.getCoefficient(fourSides)).toBe(coeff);
    });
});
