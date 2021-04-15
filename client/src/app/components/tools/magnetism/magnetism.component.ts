import { Component } from '@angular/core';
import { MagnetismeService } from '@app/services/tools/selection/magnetisme/magnetisme.service';

@Component({
    selector: 'app-magnetism',
    templateUrl: './magnetism.component.html',
    styleUrls: ['./magnetism.component.scss'],
})
export class MagnetismComponent {
    constructor(public magnetism: MagnetismeService) {}

    onApplyMagnet(): void {
        this.magnetism.applyMagnet = !this.magnetism.applyMagnet;
    }
}
