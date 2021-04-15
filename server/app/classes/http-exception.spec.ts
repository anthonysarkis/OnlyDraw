import { HttpStatus } from '@common/http-status-codes/http-status-codes';
import { expect } from 'chai';
import { describe } from 'mocha';
import { HttpException } from './http-exception';

describe('HttpException', () => {
    it('should create a simple HTTPException', () => {
        const createdMessage = 'Image created successfuly';
        const httpException: HttpException = new HttpException(HttpStatus.OK, createdMessage);
        expect(httpException.message).to.equals(createdMessage);
    });
});
