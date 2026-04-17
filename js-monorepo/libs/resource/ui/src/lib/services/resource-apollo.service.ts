import { inject, Injectable } from '@angular/core';
import {
  GetResourcesResponse,
  NewResourceItem,
  ResourceItem,
  ResourceQuery,
  UpdateResourceInput,
} from '@hub/resource-data';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, Observable } from 'rxjs';
import {
  DEFAULT_RESOURCE_LIMIT,
  DEFAULT_RESOURCE_OFFSET,
} from '../constants/ui.constants';

type ResourcesQueryResponse = {
  resources: GetResourcesResponse;
};

type ResourceQueryResponse = {
  resource: ResourceItem | null;
};

type CreateResourceMutationResponse = {
  createResource: ResourceItem;
};

type UpdateResourceMutationResponse = {
  updateResource: ResourceItem;
};

type DeleteResourceMutationResponse = {
  deleteResource: boolean;
};

@Injectable({ providedIn: 'root' })
export class ResourceApolloService {
  private readonly _apollo = inject(Apollo);

  public getResources(filter?: ResourceQuery): Observable<GetResourcesResponse> {
    const variables = {
      limit: filter?.limit ?? DEFAULT_RESOURCE_LIMIT,
      offset: filter?.offset ?? DEFAULT_RESOURCE_OFFSET,
      type: filter?.type,
      status: filter?.status,
      category: filter?.category,
    };

    return this._apollo
      .watchQuery<ResourcesQueryResponse>({
        query: gql`
          query GetResources(
            $limit: Int!
            $offset: Int!
            $type: ResourceType
            $status: ResourceStatus
            $category: String
          ) {
            resources(
              limit: $limit
              offset: $offset
              type: $type
              status: $status
              category: $category
            ) {
              data {
                id
                title
                url
                description
                category
                type
                status
                metadata
                createdAt
                updatedAt
              }
              total
              limit
              offset
            }
          }
        `,
        variables,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map(({ data }) => {
          if (!data?.resources) {
            return {
              data: [],
              total: 0,
              limit: variables.limit,
              offset: variables.offset,
            };
          }

          return data.resources as GetResourcesResponse;
        }),
      );
  }

  public getResource(id: string): Observable<ResourceItem | null> {
    return this._apollo
      .query<ResourceQueryResponse>({
        query: gql`
          query GetResource($id: String!) {
            resource(id: $id) {
              id
              title
              url
              description
              category
              type
              status
              metadata
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map(({ data }) => data?.resource ?? null));
  }

  public createResource(input: NewResourceItem): Observable<ResourceItem> {
    return this._apollo
      .mutate<CreateResourceMutationResponse>({
        mutation: gql`
          mutation CreateResource($input: CreateResourceInput!) {
            createResource(input: $input) {
              id
              title
              url
              description
              category
              type
              status
              metadata
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input,
        },
      })
      .pipe(map(({ data }) => data?.createResource as ResourceItem));
  }

  public updateResource(
    id: string,
    input: UpdateResourceInput,
  ): Observable<ResourceItem> {
    return this._apollo
      .mutate<UpdateResourceMutationResponse>({
        mutation: gql`
          mutation UpdateResource($id: String!, $input: UpdateResourceInput!) {
            updateResource(id: $id, input: $input) {
              id
              title
              url
              description
              category
              type
              status
              metadata
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          id,
          input,
        },
      })
      .pipe(map(({ data }) => data?.updateResource as ResourceItem));
  }

  public deleteResource(id: string): Observable<boolean> {
    return this._apollo
      .mutate<DeleteResourceMutationResponse>({
        mutation: gql`
          mutation DeleteResource($id: String!) {
            deleteResource(id: $id)
          }
        `,
        variables: { id },
      })
      .pipe(map(({ data }) => Boolean(data?.deleteResource)));
  }
}
