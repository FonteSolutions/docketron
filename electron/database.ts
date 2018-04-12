import {Database as SqDatabase, verbose, Statement} from 'sqlite3';
import * as path from 'path';
import {Config} from './config';
import {Observable} from 'rxjs/Observable';

export class Database {
    db: SqDatabase;
    config: Config = new Config();

    constructor() {
        this.db = new SqDatabase(
            path.join(__dirname, this.config.dbName), (error) => {
                if (error) {
                    console.log('Error on opening database', error);
                    return;
                }
                this.createTables();
                this.verifyVersion();
            }
        );
    }

    createTables() {
        this.execute('CREATE TABLE IF NOT EXISTS presets (' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT' +
            ', name TEXT NOT NULL UNIQUE' +
            ', cmd TEXT' +
            ', ports TEXT' +
            ', volumes TEXT' +
            ', envs TEXT' +
            ')');
        this.execute('CREATE TABLE IF NOT EXISTS versions (' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT' +
            ', version TEXT NOT NULL UNIQUE)');
    }

    verifyVersion() {
        this.find('SELECT * FROM versions WHERE version = ?', [this.config.version]).subscribe(data => {
            if (data.length === 0) {
                this.execute('INSERT INTO versions (version) VALUES (?)', [this.config.version]);
            }
        });
    }

    // @TODO : Observable<any>
    execute(sql: string, params?: any[]) {
        if (params && params.length) {
            const stmt = this.db.prepare(sql);
            stmt.run(params);
            stmt.finalize();
            return;
        }
        this.db.run(sql);
    }

    find(sql: string, params?: any[]): Observable<any> {
        return Observable.create(observer => {
            if (params && params.length) {
                const stmt = this.db.prepare(sql);
                const results = stmt.all(params, (error, result) => {
                    if (error) {
                        console.log('error', error);
                        observer.complete();
                    }
                    observer.next(result);
                    observer.complete();
                });

                stmt.finalize();
            }

            this.db.all(sql, (error, rows) => {
                if (error) {
                    console.log('error', error);
                }
                observer.next(rows);
                observer.complete();
            });
        });

    }
}
