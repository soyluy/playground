import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '@hub/ui-infra';

type QueryParams = Record<string, unknown>;
type PathParams = Record<string, string>;
type Params = {
  query?: QueryParams;
  path?: PathParams;
};

@Injectable({
  providedIn: 'root',
})
export class UrlBuilderService {
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;

  private buildQueryParams(query: Record<string, unknown>): URLSearchParams {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      const isArray = Array.isArray(value);
      if (isArray) {
        for (const v of value) {
          queryParams.append(
            key,
            typeof v === 'object' ? v?.toString() : String(v),
          );
        }
      } else {
        if (value !== undefined && value !== null) {
          queryParams.set(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value),
          );
        }
      }
    }
    return queryParams;
  }

  public urlBuilder(
    path: string,
    params?: Params,
    apiUrl = this._apiUrl,
  ): string {
    const pathParams = params?.path;
    const queryParams = params?.query;
    let url = `${apiUrl}/${path}`;
    if (pathParams) {
      url = url.replace(/{(\w+)}/g, (match, key) => pathParams[key] || match);
    }
    if (queryParams) {
      url = url.concat(`?${this.buildQueryParams(queryParams).toString()}`);
    }
    return url;
  }
}
