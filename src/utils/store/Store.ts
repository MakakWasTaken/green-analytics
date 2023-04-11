/* eslint-disable @typescript-eslint/no-explicit-any */
export type Filter = {
  field: string
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'array-contains'
  value: any
}

export abstract class Store {
  /**
   * @param {string} tableName - The name of the table to query
   * @returns {Promise<T>} - The data from the store
   * @memberof Store
   * @description Get a single data point from the store
   */
  abstract get<T = any>(tableName: string, id: string): Promise<T>

  /**
   * @param {string} tableName - The name of the table to query
   * @param {object} filters - The filters to apply to the query
   * @returns {Promise<T[]>} - The data from the store
   * @memberof Store
   * @description Get a list of data points from the store
   */
  abstract getAll<T = any>(tableName: string, filters?: Filter[]): Promise<T[]>

  /**
   * @param {string} tableName - The name of the table to insert into
   * @returns {Promise<boolean>} - Whether the insert was successful
   * @memberof Store
   * @description Insert some data into the store
   */
  abstract insert<T = any>(tableName: string, data: T): Promise<boolean>

  /**
   * @param {string} tableName - The name of the table to insert into
   * @param {string} id - The id of the document to update
   * @param {object} data - The data to update
   * @returns {Promise<boolean>} - Whether the update was successful
   * @memberof Store
   * @description Update some data in the store
   */
  abstract update<T = any>(
    tableName: string,
    id: string,
    data: Partial<T>,
  ): Promise<boolean>

  /**
   * @param {string} tableName - The name of the table to insert into
   * @param {string} id - The id of the document to delete
   * @returns {Promise<boolean>} - Whether the delete was successful
   * @memberof Store
   * @description Delete some data from the store
   */
  abstract delete(tableName: string, id: string): Promise<boolean>
}
