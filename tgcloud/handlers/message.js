import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { users, userSettings } from '../schema.js';

export default async function (message) {
  if (!message?.chat?.id || !message.from?.id) return;
  const chatId = message.chat.id;
  const userId = message.from.id;
  const command = (message.text ?? '').trim();

  await db.insert(users).values({ userId, lastSeenAt: new Date() })
    .onConflictDoUpdate({ target: users.userId, set: { lastSeenAt: new Date() } }).run();
  await db.insert(userSettings).values({ userId, symbols: [], notificationsEnabled: true, updatedAt: new Date() })
    .onConflictDoUpdate({ target: userSettings.userId, set: { updatedAt: new Date() } }).run();

  if (command === '/start' || command === '/settings') {
    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).get();
    await api.sendMessage({
      chat_id: chatId,
      text: `Forex Signal Serverless shell\nNotifications: ${settings?.notificationsEnabled ? 'on' : 'off'}\nWatchlist: ${JSON.stringify(settings?.symbols ?? [])}\n\nMarket scanning and analysis are not connected; no live signal is being generated.`
    });
    return;
  }

  await api.sendMessage({ chat_id: chatId, text: 'This migration shell manages settings only. Live signals require a trusted, authenticated external analysis service.' });
}
