import { ExecutionContext, Injectable } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

@Injectable()
export class SessionAuthService {
  constructor(private readonly _requestContextService: RequestContextService) {}

  isAuthenticated(context: ExecutionContext): boolean {
    const request = this._requestContextService.getRequest(context);

    if (typeof request?.isAuthenticated !== 'function') {
      return false;
    }

    return request.isAuthenticated();
  }
}
