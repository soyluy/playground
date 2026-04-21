import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '../tokens/environment.token';

@Injectable({ providedIn: 'root' })
export class DbWrapperService {
  private _db!: IDBDatabase;
  readonly ready: Promise<void>;

  private readonly _environment = inject(ENVIRONMENT);

  constructor() {
    this.ready = new Promise((resolve, reject) => {
      const req = indexedDB.open(
        this._environment.databaseName,
        this._environment.databaseVersion,
      );

      req.onerror = (event) => {
        console.error(event);
        reject(event);
      };

      req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        if (!event.target) return;
        this._db = (event.target as IDBOpenDBRequest).result;
        const objectStore = this._db.createObjectStore(
          this._environment.expensesObjStoreName,
          { keyPath: 'id' },
        );
        objectStore.createIndex('date', 'date', { unique: false });
      };

      req.onsuccess = (event) => {
        this._db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  async writeToStore<T>(store: string, data: T[]): Promise<void> {
    await this.ready;
    const transaction = this._db.transaction(store, 'readwrite');
    transaction.oncomplete = () => console.log('transaction complete!');
    transaction.onerror = (event) =>
      console.error('a transaction error occurred: ', event);

    const objectStore = transaction.objectStore(store);
    data.forEach((d) => {
      const req = objectStore.add(d);
      req.onsuccess = (event) => {
        const target = event.target as IDBRequest;
        console.log('Adding', target.result, d, 'to', store, 'success');
      };
    });
  }

  async deleteFromStore(store: string, key: string): Promise<void> {
    await this.ready;
    const req = this._db
      .transaction(store, 'readwrite')
      .objectStore(store)
      .delete(key);
    req.onsuccess = () => console.log('deleted!', key);
    req.onerror = (event) => console.error('a delete error occurred: ', event);
  }

  async readFromStore(store: string, key: string): Promise<void> {
    await this.ready;
    const req = this._db
      .transaction(store, 'readonly')
      .objectStore(store)
      .get(key);
    req.onsuccess = (event) => {
      const target = event.target as IDBRequest;
      console.log('Got that!', target.result);
    };
  }

  async bulkReadFromStore<T>(
    store: string,
    callbackFn?: (data: T[]) => void,
  ): Promise<void> {
    await this.ready;
    const req = this._db
      .transaction(store, 'readonly')
      .objectStore(store)
      .getAll();
    req.onsuccess = (event) => {
      const target = event.target as IDBRequest<T[]>;
      if (callbackFn) callbackFn(target.result);
      else console.log("Got'em!", target.result);
    };
  }
}
