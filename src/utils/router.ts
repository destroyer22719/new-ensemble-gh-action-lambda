/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Router from 'koa-router';
import {Obj} from './globals';
import {CTX, STATE} from './ctx';
// import * as util from 'util';

type DocPathParamOpts = {
  description?: string,
  required?: boolean,
  schema?: Obj,
};

type DocQueryParamOpts = {
  description?: string,
  required?: boolean,
  schema?: Obj,
};

type DocBodyParamOpts = {
  summary?: string,
  value?: Obj<string>,
};

type DocRouteOpts = {
  summary?: string,
  description?: string,
  responses?: Obj,
  query?: Obj<DocQueryParamOpts>,
  params?: Obj<DocPathParamOpts>,
  body?: Obj<DocBodyParamOpts>,
  bodyExamples?: Obj<Obj>,
};

type MWBase<StateT, CustomT> = Router.IMiddleware<StateT, CustomT>;
type MWParams<StateT, CustomT> = Parameters<MWBase<StateT, CustomT>>;
type MWCtx<StateT, CustomT> = MWParams<StateT, CustomT>[0];
type MWNext = () => Promise<any>;
type StrippedRequest<StateT, CustomT> =
  Omit<MWCtx<StateT, CustomT>['request'], 'body'>;
type StrippedMWCtx<StateT, CustomT> =
  Omit<Omit<Omit<MWCtx<StateT, CustomT>, 'params'>, 'query'>, 'request'>;

type FinalMWCtx<StateT, CustomT> =
  StrippedMWCtx<StateT, CustomT> & {request: StrippedRequest<StateT, CustomT>};
type MW<StateT, CustomT, ParamsT> =
  (ctx: FinalMWCtx<StateT, CustomT> & ParamsT, next: MWNext) => Promise<any>;

export class DocRouter<StateT = STATE, CustomT = CTX> extends Router<StateT, CustomT> {
  
  swaggerPaths: Obj = {};

  constructor (public opts: Router.IRouterOptions & {name?: string} = {}) {
    super(opts);
  }

  $<P
  extends any | Obj<DocPathParamOpts>,
    Q extends any | Obj<DocQueryParamOpts>,
    B extends any | Obj<DocBodyParamOpts>
  >(

    httpRoute: string,

    routeOpts: DocRouteOpts & {params?: P, query?: Q, body?: B},

    ...args: MW<StateT, CustomT, {
      params: P extends null ? never : Record<keyof P, string>,
      query: Q extends null ? never : Record<keyof Q, string>,
      request: {
        body: B extends null ? never : Record<keyof B, any>,
      },
    }>[]

  ) {
    const [method, route] = httpRoute.split(' ');

    const koaRoute = route.replace(/\{(.*?)\}/ug, ':$1');
    const koaMethod = method.toLowerCase() as 'get' | 'post' | 'delete' | 'put';
    (super[koaMethod] as any)(koaRoute, ...args);

    const transQueryParams = routeOpts.query ? Object.entries(routeOpts.query).map(([name, val]) => ({
      in: 'query',
      name,
      ...val,
    })) : null;

    const transPathParams = routeOpts.params ? Object.entries(routeOpts.params).map(([name, val]) => ({
      in: 'path',
      name,
      ...val,
    })) : null;

    const transBodyParams = routeOpts.body ? Object.entries(routeOpts.body).map(([name, val]) => ({
      name,
      ...val,
    })) : null;

    let prefixedRoute = this.opts.prefix ? this.opts.prefix + route : route;
    prefixedRoute = prefixedRoute.endsWith('/') ? prefixedRoute.slice(0, -1) : prefixedRoute;

    this.swaggerPaths[prefixedRoute] = {
      ...this.swaggerPaths[prefixedRoute],
      [koaMethod]: {
        parameters: [
          ...transQueryParams ? [...transQueryParams] : [],
          ...transPathParams ? [...transPathParams] : [],
        ],
        ...transBodyParams &&
          {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                  examples: routeOpts.bodyExamples ?
                    Object.entries(routeOpts.bodyExamples).reduce(
                      (acc, [name, obj]) => ({...acc, [name]: {value: obj}}), {})
                    : undefined,
                },
              },
              description: transBodyParams.map(({name, summary}) => `**${name}** - ${summary}`).join('\n\n'),
            },
          },
        tags: this.opts.name ? [this.opts.name] : undefined,
        summary: routeOpts.summary,
        description: routeOpts.description,
        responses: routeOpts.responses,
      },
    };
  }
}
