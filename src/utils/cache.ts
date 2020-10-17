import * as redis from 'async-redis';
import {Obj} from './globals';
const createRedisClient = redis.createClient;

class CacheClient {

  redisClient: ReturnType<typeof createRedisClient> = null;

  objectFallback: Obj<string> = null;

  get (key: string): Promise<string> {
    return !this.redisClient
      ? Promise.resolve(this.objectFallback[key])
      : this.redisClient.get(key) as Promise<unknown> as Promise<string>;
  }

  set (key: string, val: unknown, minutes?: number): Promise<void> {
    const value = JSON.stringify(val);

    return !this.redisClient
      ? Promise.resolve(this.objectFallback[key] = value) as Promise<unknown> as Promise<void>
      : this.redisClient.setex(key, (minutes || 15) * 60, value) as Promise<unknown> as Promise<void>;
  }

  del (key: string): Promise<void> {
    return !this.redisClient
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      ? Promise.resolve(delete this.objectFallback[key]) as Promise<unknown> as Promise<void>
      : this.redisClient.del(key) as Promise<unknown> as Promise<void>;
  }

  constructor () {
    if (process.env.REDIS_URL) this.redisClient = redis.createClient({url: process.env.REDIS_URL});
    else this.objectFallback = {};
  }

}

export class Cache {

  entity: new () => unknown = null;

  queryName: string = null;

  key = null;

  private static client: CacheClient = null;

  static clientType (): 'redis' | 'obj' {
    return Cache.client.redisClient ? 'redis' : 'obj';
  }

  static inst: Cache = new Cache();

  static connect () {
    Cache.client = new CacheClient();
  }

  static for (entity: new () => unknown) {
    const cache = new Cache();
    cache.entity = entity;
    return cache;
  }

  private keyName (key: string) {
    let k = [];
    if (this.entity) k.push(this.entity.name);
    if (this.queryName) k = [...k, 'Query', this.queryName];
    k.push(key);
    return k.join(':');
  }

  async set (key: string, val: string, minutes?: number) {
    await Cache.client.set(this.keyName(key), val, minutes);
    return this;
  }

  get (key: string) {
    return Cache.client.get(this.keyName(key));
  }

  query (query: string) {
    this.queryName = query;
    return this;
  }

  async clear (key: string) {
    await Cache.client.del(this.keyName(key));
    return this;
  }

  async getOr (key: string, callback: () => string | Promise<string>) {
    return await Cache.client.get(this.keyName(key)) || callback();
  }
}
