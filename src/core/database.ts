import sqlite from "better-sqlite3";

export class Database {
    public readonly connection: sqlite;
    constructor() {
        this.connection = sqlite('foobar.db')
    }

    init() {
        this.connection.exec(`CREATE TABLE IF NOT EXISTS accounts (
    telegram_id INT(255),
    discord_id INT(255),
    PRIMARY KEY (telegram_id)
)`)
    }
}
