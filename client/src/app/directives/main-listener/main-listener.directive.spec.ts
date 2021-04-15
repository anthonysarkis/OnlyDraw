import { async, TestBed } from '@angular/core/testing';
import { ShortcutKeys } from '@app/enums/shortcut-keys';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { MainListenerDirective } from './main-listener.directive';

describe('MainListenerDirective', () => {
    let hotkeyServiceSpy: jasmine.SpyObj<HotkeysService>;
    let directive: MainListenerDirective;

    beforeEach(async(() => {
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeysService', ['isShortcutCalled']);

        TestBed.configureTestingModule({
            declarations: [MainListenerDirective],
            providers: [{ HotkeysService, useValue: hotkeyServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        directive = new MainListenerDirective(hotkeyServiceSpy);
        // tslint:disable-next-line: no-string-literal
        directive['availableKeys'].add(ShortcutKeys.NewCanvas);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call isShortcutCalled when key exists and ctrlKey is clicked', () => {
        const keyboardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.NewCanvas,
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(hotkeyServiceSpy.isShortcutCalled).toHaveBeenCalled();
    });

    it('should not call isShortcutCalled when key does not exist', () => {
        const keyboardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.Export,
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(hotkeyServiceSpy.isShortcutCalled).not.toHaveBeenCalled();
    });

    it('should not call isShortcutCalled when ctrlKey not clicked', () => {
        const keyboardEvent = {
            ctrlKey: false,
            key: ShortcutKeys.NewCanvas,
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(hotkeyServiceSpy.isShortcutCalled).not.toHaveBeenCalled();
    });
});
