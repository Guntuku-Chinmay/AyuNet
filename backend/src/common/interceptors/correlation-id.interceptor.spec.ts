import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('CorrelationIdInterceptor', () => {
  let interceptor: CorrelationIdInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationIdInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should attach X-Correlation-Id header to HTTP requests and responses', (done) => {
    const mockRequest: any = { headers: {}, method: 'GET', url: '/test' };
    const mockResponse: any = { setHeader: jest.fn(), statusCode: 200 };

    const mockExecutionContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
        getNext: jest.fn(),
      }),
    };

    const mockCallHandler: CallHandler = {
      handle: () => of({ success: true }),
    };

    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.headers['x-correlation-id']).toBeDefined();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Correlation-Id', expect.any(String));
      done();
    });
  });
});
