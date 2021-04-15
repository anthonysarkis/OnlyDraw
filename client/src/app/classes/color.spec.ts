import { Color } from '@app/classes/color';

describe('Color', () => {
    let classColor: Color;

    it('it sould add zero infront of string if length equal to 1', () => {
        classColor = new Color(0, 0, 0, 0);
        const hexValue = classColor.getHex();
        expect(hexValue).toBe('#00000000');
    });
});
