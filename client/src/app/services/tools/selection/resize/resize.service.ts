import { CdkDragMove } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { END, SELECTION_ANCHOR_OFFSET, SELECTION_ANCHOR_SIZE, START } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { Anchor } from '@app/enums/drag-anchors';
import { Dimensions } from '@app/interfaces/dimensions';

@Injectable({
    providedIn: 'root',
})
export class ResizeService {
    previewDimensions: Dimensions;
    dimensions: Dimensions;
    previewCorners: Vec2[];
    corners: Vec2[];
    private selectedAnchor: number;
    anchors: Vec2[];
    private lastPosition: Vec2;

    mirrorX: boolean;
    mirrorY: boolean;
    private shiftDown: boolean;
    private isBorderSelected: boolean;

    private resizeBindings: Map<Anchor, (position: Vec2) => void>;
    private mirrorBindings: Map<Anchor, () => void>;
    private shiftBindings: Map<Anchor, () => void>;

    constructor() {
        this.previewDimensions = { width: 0, height: 0 };
        this.dimensions = { width: 0, height: 0 };
        this.anchors = new Array(SELECTION_ANCHOR_SIZE).fill({ x: 0, y: 0 });
        this.updateAnchors(this.dimensions, 0);
        this.bindResizingHandlers();
        this.bindMirrorHandlers();
        this.bindShiftHandlers();
        this.mirrorX = false;
        this.mirrorY = false;
        this.isShiftDown = false;
        this.isBorderSelected = false;
        this.selectedAnchor = 0;
        this.lastPosition = { x: 0, y: 0 };
        this.corners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        this.previewCorners = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
    }

    get isShiftDown(): boolean {
        return this.shiftDown;
    }

    set isShiftDown(newValue: boolean) {
        this.shiftDown = newValue;
        if (this.selectedAnchor && this.isBorderSelected) this.updatePreviewDimensions(this.lastPosition, this.selectedAnchor);
    }

    updateDimensions(newWidth: number, newHeight: number): void {
        this.previewDimensions = { width: newWidth, height: newHeight };
        this.updateAnchors(this.dimensions, SELECTION_ANCHOR_OFFSET);
    }

    updateAnchors(dimensions: Dimensions, offset: number): void {
        this.anchors = this.updateAnchorPositions(dimensions, offset);
        this.dimensions.width = dimensions.width;
        this.dimensions.height = dimensions.height;
    }

    dragMove(event: CdkDragMove, selectedAnchor: number): void {
        this.isBorderSelected = true;
        this.selectedAnchor = selectedAnchor;
        this.lastPosition = { x: event.source.getFreeDragPosition().x, y: event.source.getFreeDragPosition().y };
        this.updatePreviewDimensions(this.lastPosition, this.selectedAnchor);
    }

    dragEnd(): void {
        this.updateProperties(this.selectedAnchor);
        this.updateAnchors(this.dimensions, SELECTION_ANCHOR_OFFSET);
        this.lastPosition = { x: this.previewDimensions.width - SELECTION_ANCHOR_OFFSET, y: this.previewDimensions.height - SELECTION_ANCHOR_OFFSET };
        this.isBorderSelected = false;
    }

    updateCorners(corner: Vec2, dimensions: Dimensions): void {
        this.dimensions = dimensions;
        this.previewDimensions = { width: this.dimensions.width, height: this.dimensions.height };
        this.corners = [corner, { x: corner.x + dimensions.width, y: corner.y + dimensions.height }];
        this.previewCorners = [
            { x: corner.x, y: corner.y },
            { x: corner.x + dimensions.width, y: corner.y + dimensions.height },
        ];
    }

    resetProperties(): void {
        this.mirrorX = false;
        this.mirrorY = false;
        this.isShiftDown = false;
    }

    private updatePreviewDimensions(position: Vec2, selectedAnchor: number): void {
        const resizingMethod = this.resizeBindings.get(selectedAnchor) as (position: Vec2) => void;
        resizingMethod(position);
    }

    private updateProperties(selectedAnchor: number): void {
        this.checkIfNeedsMirror(selectedAnchor);
        this.dimensions = { width: this.previewDimensions.width, height: this.previewDimensions.height };
        this.previewCorners[END] = {
            x: this.previewCorners[START].x + this.dimensions.width,
            y: this.previewCorners[START].y + this.dimensions.height,
        };
        this.corners[START] = { x: this.previewCorners[START].x, y: this.previewCorners[START].y };
        this.corners[END] = { x: this.previewCorners[END].x, y: this.previewCorners[END].y };
    }

    private checkIfNeedsMirror(selectedAnchor: number): void {
        const mirrorMethod = this.mirrorBindings.get(selectedAnchor) as () => void;
        mirrorMethod();
    }

    private positiveXMirror(): void {
        this.mirrorX = this.corners[START].x !== this.previewCorners[START].x ? true : false;
    }

    private positiveYMirror(): void {
        this.mirrorY = this.corners[START].y !== this.previewCorners[START].y ? true : false;
    }

    private negativeXMirror(): void {
        this.mirrorX = this.corners[END].x === this.previewCorners[START].x ? true : false;
    }

    private positiveXShift(): void {
        if (this.previewCorners[START].x !== this.corners[START].x) {
            this.previewCorners[START].x = this.corners[START].x - this.previewDimensions.width;
        }
    }

    private positiveYShift(): void {
        if (this.previewCorners[START].y !== this.corners[START].y) {
            this.previewCorners[START].y = this.corners[START].y - this.previewDimensions.height;
        }
    }

    private negativeXShift(): void {
        if (this.previewCorners[START].x !== this.corners[END].x) {
            this.previewCorners[START].x = this.corners[END].x - this.previewDimensions.width;
        }
    }

    private negativeYShift(): void {
        if (this.previewCorners[START].y !== this.corners[END].y) {
            this.previewCorners[START].y = this.corners[END].y - this.previewDimensions.height;
        }
    }

    private negativeYMirror(): void {
        this.mirrorY = this.corners[END].y === this.previewCorners[START].y ? true : false;
    }

    private leftMiddleHandler(position: Vec2): void {
        if (position.x > this.dimensions.width) {
            this.previewCorners[START].x = this.corners[END].x;
            this.previewDimensions.width = position.x - this.dimensions.width;
        } else {
            this.previewCorners[START].x = this.corners[START].x + position.x;
            this.previewDimensions.width = this.dimensions.width - position.x;
        }
    }

    private bottomMiddleHandler(position: Vec2): void {
        if (position.y < -SELECTION_ANCHOR_SIZE) {
            this.previewCorners[START].y = this.corners[START].y + position.y;
            this.previewDimensions.height = Math.abs(position.y);
        } else {
            this.previewDimensions.height = this.dimensions.height - (this.anchors[Anchor.BottomMiddleAnchor].y - position.y);
            this.previewCorners[START].y = this.corners[START].y;
        }
    }

    private topMiddleHandler(position: Vec2): void {
        if (position.y > this.dimensions.height) {
            this.previewCorners[START].y = this.corners[END].y;
            this.previewDimensions.height = position.y - this.dimensions.height;
        } else {
            this.previewCorners[START].y = this.corners[START].y + position.y;
            this.previewDimensions.height = this.dimensions.height - position.y;
        }
    }

    private rightMiddleHandler(position: Vec2): void {
        if (position.x < -SELECTION_ANCHOR_SIZE) {
            this.previewCorners[START].x = this.corners[START].x + position.x;
            this.previewDimensions.width = Math.abs(position.x);
        } else {
            this.previewDimensions.width = this.dimensions.width - (this.anchors[Anchor.RightMiddleAnchor].x - position.x);
            this.previewCorners[START].x = this.corners[START].x;
        }
    }

    private topRightHandler(position: Vec2): void {
        this.rightMiddleHandler(position);
        this.topMiddleHandler(position);
        if (this.isShiftDown) this.equalizeDimensions(Anchor.TopRightAnchor);
    }

    private bottomLeftHandler(position: Vec2): void {
        this.leftMiddleHandler(position);
        this.bottomMiddleHandler(position);
        if (this.isShiftDown) this.equalizeDimensions(Anchor.BottomLeftAnchor);
    }

    private topLeftHandler(position: Vec2): void {
        this.leftMiddleHandler(position);
        this.topMiddleHandler(position);
        if (this.isShiftDown) this.equalizeDimensions(Anchor.TopLeftAnchor);
    }

    private bottomRightHandler(position: Vec2): void {
        this.rightMiddleHandler(position);
        this.bottomMiddleHandler(position);
        if (this.isShiftDown) this.equalizeDimensions(Anchor.BottomRightAnchor);
    }

    private bindResizingHandlers(): void {
        this.resizeBindings = new Map();
        this.resizeBindings.set(Anchor.TopLeftAnchor, (position): void => {
            this.topLeftHandler(position);
        });
        this.resizeBindings.set(Anchor.TopMiddleAnchor, (position): void => {
            this.topMiddleHandler(position);
        });
        this.resizeBindings.set(Anchor.TopRightAnchor, (position): void => {
            this.topRightHandler(position);
        });
        this.resizeBindings.set(Anchor.RightMiddleAnchor, (position): void => {
            this.rightMiddleHandler(position);
        });
        this.resizeBindings.set(Anchor.BottomRightAnchor, (position): void => {
            this.bottomRightHandler(position);
        });
        this.resizeBindings.set(Anchor.BottomMiddleAnchor, (position): void => {
            this.bottomMiddleHandler(position);
        });
        this.resizeBindings.set(Anchor.BottomLeftAnchor, (position): void => {
            this.bottomLeftHandler(position);
        });
        this.resizeBindings.set(Anchor.LeftMiddleAnchor, (position): void => {
            this.leftMiddleHandler(position);
        });
    }

    private bindMirrorHandlers(): void {
        this.mirrorBindings = new Map();
        this.mirrorBindings.set(Anchor.TopLeftAnchor, (): void => {
            this.negativeXMirror();
            this.negativeYMirror();
        });
        this.mirrorBindings.set(Anchor.TopMiddleAnchor, (): void => {
            this.negativeXMirror();
            this.negativeYMirror();
        });
        this.mirrorBindings.set(Anchor.TopRightAnchor, (): void => {
            this.positiveXMirror();
            this.negativeYMirror();
        });
        this.mirrorBindings.set(Anchor.RightMiddleAnchor, (): void => {
            this.positiveXMirror();
            this.positiveYMirror();
        });
        this.mirrorBindings.set(Anchor.BottomRightAnchor, (): void => {
            this.positiveXMirror();
            this.positiveYMirror();
        });
        this.mirrorBindings.set(Anchor.BottomMiddleAnchor, (): void => {
            this.positiveXMirror();
            this.positiveYMirror();
        });
        this.mirrorBindings.set(Anchor.BottomLeftAnchor, (): void => {
            this.negativeXMirror();
            this.positiveYMirror();
        });
        this.mirrorBindings.set(Anchor.LeftMiddleAnchor, (): void => {
            this.negativeXMirror();
            this.negativeYMirror();
        });
    }

    private bindShiftHandlers(): void {
        this.shiftBindings = new Map();
        this.shiftBindings.set(Anchor.TopLeftAnchor, (): void => {
            this.negativeXShift();
            this.negativeYShift();
        });
        this.shiftBindings.set(Anchor.TopRightAnchor, (): void => {
            this.positiveXShift();
            this.negativeYShift();
        });
        this.shiftBindings.set(Anchor.BottomRightAnchor, (): void => {
            this.positiveXShift();
            this.positiveYShift();
        });
        this.shiftBindings.set(Anchor.BottomLeftAnchor, (): void => {
            this.negativeXShift();
            this.positiveYShift();
        });
    }

    private updateAnchorPositions(dimensions: Dimensions, offset: number): Vec2[] {
        const anchors: Vec2[] = new Array(SELECTION_ANCHOR_SIZE).fill({ x: 0, y: 0 });
        anchors[Anchor.TopLeftAnchor] = { x: -offset, y: -offset };
        anchors[Anchor.TopMiddleAnchor] = { x: dimensions.width / 2 - offset, y: -offset - 2 };
        anchors[Anchor.TopRightAnchor] = { x: dimensions.width - offset, y: -offset };
        anchors[Anchor.RightMiddleAnchor] = { x: dimensions.width - offset, y: dimensions.height / 2 - offset };
        anchors[Anchor.BottomRightAnchor] = { x: dimensions.width - offset, y: dimensions.height - offset };
        anchors[Anchor.BottomMiddleAnchor] = { x: dimensions.width / 2 - offset, y: dimensions.height - offset };
        anchors[Anchor.BottomLeftAnchor] = { x: -offset, y: dimensions.height - offset };
        anchors[Anchor.LeftMiddleAnchor] = { x: -offset - 2, y: dimensions.height / 2 - offset };
        return anchors;
    }

    private equalizeDimensions(selectedAnchor: number): void {
        if (this.previewDimensions.width <= this.previewDimensions.height) this.previewDimensions.height = this.previewDimensions.width;
        else this.previewDimensions.width = this.previewDimensions.height;
        const shiftMethod = this.shiftBindings.get(selectedAnchor) as () => void;
        shiftMethod();
    }
}
