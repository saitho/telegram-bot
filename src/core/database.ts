import sqlite from "better-sqlite3";

export interface Account {
    telegram_id: number;
    discord_id: number;
}

export interface Subscription {
    telegram_id: number;
    service_id: number;
}

export class Database {
    protected static conn: sqlite = null;

    static get connection(): sqlite {
        if (!this.conn) {
            this.conn = sqlite('foobar.db')
            this.init()
        }
        return this.conn
    }

    static init() {
        this.connection.exec(`CREATE TABLE IF NOT EXISTS accounts (
    telegram_id INT(255),
    discord_id INT(255),
    PRIMARY KEY (telegram_id)
)`)
        this.connection.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
    telegram_id INT(255),
    service_id VARCHAR(255),
    UNIQUE (telegram_id, service_id)
)`)
    }
}
