import {config} from 'dotenv';
config();

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

import * as Koa from 'koa';
import {DB} from './utils/db';
import * as cors from '@koa/cors';
import * as logger from 'koa-logger';
import * as koaBody from 'koa-body';
import {koaSwagger} from 'koa2-swagger-ui';
import * as Sentry from '@sentry/node';
import * as serverless from 'serverless-http';
import * as routers from './routers';
import {APIGatewayProxyEvent, APIGatewayProxyEventV2, Context} from 'aws-lambda';
import {ifDev, ifProd} from './utils/nodeenv';
import * as awsXRay from 'aws-xray-sdk';
import * as awsSdk from 'aws-sdk';
awsXRay.captureAWS(awsSdk);

const app = new Koa();

app.use(cors());

app.use(koaBody());

for (const r of Object.values(routers))
  app.use(r.routes()).use(r.allowedMethods());

// eslint-disable-next-line @typescript-eslint/no-explicit-any

ifDev(() => {

  const swaggerPaths = {};
  app.use(koaSwagger({
    swaggerOptions: {
      spec: {
        openapi: '3.0.0',
        paths: swaggerPaths,
      },
    },
  }));

  app.use(logger());

});

ifProd(() => {

  Sentry.init({dsn: `${process.env.SENTRY_DSN}`});

  app.on('error', (err, ctx) => {
    Sentry.withScope(scope => {
      scope.addEventProcessor(event => Sentry.Handlers.parseRequest(event, ctx.request));
      Sentry.captureException(err);
    });
  });

});
  
const serverlessLambda = serverless(app);
module.exports.handler = async (event: APIGatewayProxyEvent | APIGatewayProxyEventV2, ctx: Context) => {
  console.log(ctx);
  console.log(event);
  
  await DB.connect();
  console.log('DB: ready');

  return serverlessLambda(event, ctx);
};