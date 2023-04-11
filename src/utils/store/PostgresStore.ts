/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, Store } from './Store'

export class PostgressStore extends Store {
  get<T = any>(tableName: string, id: string): Promise<T> {
    throw new Error('Method not implemented.')
  }

  getAll<T = any>(
    tableName: string,
    filters?: Filter[] | undefined,
  ): Promise<T[]> {
    throw new Error('Method not implemented.')
  }

  insert<T = any>(tableName: string, data: T): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  update<T = any>(
    tableName: string,
    id: string,
    data: Partial<T>,
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  delete(tableName: string, id: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}
