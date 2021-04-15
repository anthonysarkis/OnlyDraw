import { Directive, HostListener } from '@angular/core';
import { ShortcutKeys } from '@app/enums/shortcut-keys';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';

@Directive({
    selector: '[appMainListener]',
})
export class MainListenerDirective {
    private availableKeys: Set<string>;

    constructor(private hotkeysService: HotkeysService) {
        this.availableKeys = new Set();
        this.availableKeys.add(ShortcutKeys.Carousel);
        this.availableKeys.add(ShortcutKeys.NewCanvas);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (!event.ctrlKey || !this.availableKeys.has(event.key)) return;
        this.hotkeysService.isShortcutCalled(event, false);
    }
}
