import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

type RequestLike = {
  isAuthenticated?: () => boolean;
};

@Injectable()
export class RequestContextService {
  getRequest(context: ExecutionContext): RequestLike | undefined {
    if (context.getType<string>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext()?.req;
    }

    return context.switchToHttp().getRequest<RequestLike>();
  }
}
