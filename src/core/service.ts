import {Database} from "./database";

interface Service {
    id: string;
    name: string;
}

export const services: Service[] = [
    {id: "test", name: "Test"},
    {id: "test2", name: "Test 2"}
];

export function subscribe(serviceId: string, telegramId: number): boolean {
    const stmt = Database.connection.prepare('INSERT INTO subscriptions (telegram_id, service_id) VALUES (?, ?)')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function unsubscribe(serviceId: string, telegramId: number): boolean {
    const stmt = Database.connection.prepare('DELETE FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function isServiceEnabled(serviceId: string, telegramId: number): boolean {
    const checkSubscription = Database.connection.prepare('SELECT COUNT(telegram_id) AS c FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = checkSubscription.get(telegramId, serviceId)
    return info['c'] > 0
}
