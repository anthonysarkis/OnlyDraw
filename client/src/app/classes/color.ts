import { BASE_HEX, MAX_RGB } from './constants';

export class Color {
    hex: string;

    constructor(public red: number, public green: number, public blue: number, public alpha: number) {
        this.hex = this.getHex();
    }

    getRgb(): string {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    }

    getHex(): string {
        const redHex = this.toHex(this.red);
        const greenHex = this.toHex(this.green);
        const blueHex = this.toHex(this.blue);
        let alphaHex = Math.round(this.alpha * MAX_RGB).toString(BASE_HEX);
        alphaHex = alphaHex.length === 1 ? `0${alphaHex}` : alphaHex;
        return '#' + redHex + greenHex + blueHex + alphaHex;
    }

    private toHex(value: number): string {
        return value < BASE_HEX ? '0' + value.toString(BASE_HEX) : value.toString(BASE_HEX);
    }
}
