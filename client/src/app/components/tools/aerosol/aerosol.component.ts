import { Component } from '@angular/core';
import {
    DIAMETER_POINT_SIZE_RATIO,
    MAX_AEROSOL_DIAMETER,
    MAX_AEROSOL_EMISSIONS,
    MIN_AEROSOL_DIAMETER,
    MIN_AEROSOL_EMISSIONS,
    MIN_AEROSOL_POINT_SIZE,
} from '@app/classes/constants';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';

@Component({
    selector: 'app-aerosol',
    templateUrl: './aerosol.component.html',
    styleUrls: ['./aerosol.component.scss'],
})
export class AerosolComponent {
    minDiameter: number;
    maxDiameter: number;
    diameter: number;

    minPointSize: number;
    maxPointSize: number;
    pointSize: number;

    minEmissions: number;
    maxEmissions: number;
    emissions: number;

    constructor(public aerosolService: AerosolService) {
        this.minDiameter = MIN_AEROSOL_DIAMETER;
        this.maxDiameter = MAX_AEROSOL_DIAMETER;
        this.diameter = this.aerosolService.diameter;

        this.minPointSize = MIN_AEROSOL_POINT_SIZE;
        this.maxPointSize = Math.ceil(this.diameter / DIAMETER_POINT_SIZE_RATIO);
        this.pointSize = this.aerosolService.pointSize;

        this.minEmissions = MIN_AEROSOL_EMISSIONS;
        this.maxEmissions = MAX_AEROSOL_EMISSIONS;
        this.emissions = this.aerosolService.emissions;
    }

    onDiameterChange(newDiameter: number): void {
        this.diameter = newDiameter;
        this.aerosolService.diameter = newDiameter;
        this.maxPointSize = Math.ceil(newDiameter / DIAMETER_POINT_SIZE_RATIO);
        this.aerosolService.pointSize = this.pointSize;
        this.pointSize = this.aerosolService.pointSize;
    }

    onPointSizeChange(newPointSize: number): void {
        this.aerosolService.pointSize = newPointSize;
        this.pointSize = this.aerosolService.pointSize;
    }

    onEmissionsChange(newEmissions: number): void {
        this.aerosolService.emissions = newEmissions;
        this.emissions = this.aerosolService.emissions;
    }
}
