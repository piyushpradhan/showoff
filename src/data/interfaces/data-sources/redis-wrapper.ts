import { redisConfig } from '@/data/data-sources/redis/config';

export interface RedisDatabaseWrapper {
  getCacheKey(prefix: keyof typeof redisConfig.keys, identifier: string): string;
  setWithTTL(key: string, value: string, ttl?: number): Promise<void>;
  healthCheck(): Promise<boolean>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<Array<string> | null>;
  hKeys(cacheKey: string): Promise<Array<string> | null>;
  hGetAll(key: string): Promise<{ [key: string]: string } | null>;
  hSet(hashKey: string, field: string, value: any): Promise<number | null>;
  hGet(hashKey: string, field: string): Promise<string | undefined | null>;
  hDel(hashKey: string, field: string): Promise<void>;
  multi(): unknown;
  expire(cacheKey: string, time: number): Promise<void>;
  quit(): Promise<void>;
}
