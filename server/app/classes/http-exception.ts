// import { HttpStatus } from '@common/http-status-codes/http-status-codes';

export class HttpException extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'HttpException';
    }
}
