import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { users, userSettings } from '../schema.js';

const MAX_WATCHLIST_SIZE = 20;
const SYMBOL_PATTERN = /^[A-Z0-9._/-]{2,20}$/;

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
      text: `Forex Signal preferences\nNotifications: ${settings?.notificationsEnabled ? 'on' : 'off'}\nWatchlist: ${JSON.stringify(settings?.symbols ?? [])}\n\nCommands: /notifications on|off, /watchlist, /watchlist add EURUSD, /watchlist remove EURUSD.\nMarket scanning is not connected; no live signal is being generated.`
    });
    return;
  }

  const parts = command.split(/\s+/);
  if (parts[0] === '/notifications' && ['on', 'off'].includes((parts[1] ?? '').toLowerCase())) {
    const enabled = parts[1].toLowerCase() === 'on';
    await db.update(userSettings).set({ notificationsEnabled: enabled, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId)).run();
    await api.sendMessage({ chat_id: chatId, text: `Notifications are now ${enabled ? 'on' : 'off'}.` });
    return;
  }

  if (parts[0] === '/watchlist') {
    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).get();
    const symbols = Array.isArray(settings?.symbols) ? settings.symbols : [];
    const action = (parts[1] ?? '').toLowerCase();
    if (!action) {
      await api.sendMessage({ chat_id: chatId, text: `Your watchlist: ${symbols.length ? symbols.join(', ') : '(empty)'}` });
      return;
    }
    if (!['add', 'remove'].includes(action) || !parts[2]) {
      await api.sendMessage({ chat_id: chatId, text: 'Usage: /watchlist add EURUSD or /watchlist remove EURUSD' });
      return;
    }
    const symbol = parts[2].toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol)) {
      await api.sendMessage({ chat_id: chatId, text: 'Invalid symbol format. Use 2–20 letters/numbers or . _ / - characters.' });
      return;
    }
    let next = symbols;
    if (action === 'add') {
      if (!symbols.includes(symbol) && symbols.length >= MAX_WATCHLIST_SIZE) {
        await api.sendMessage({ chat_id: chatId, text: `Watchlist limit is ${MAX_WATCHLIST_SIZE} symbols.` });
        return;
      }
      next = symbols.includes(symbol) ? symbols : [...symbols, symbol];
    } else {
      next = symbols.filter(item => item !== symbol);
    }
    await db.update(userSettings).set({ symbols: next, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId)).run();
    await api.sendMessage({ chat_id: chatId, text: `Watchlist updated: ${next.length ? next.join(', ') : '(empty)'}` });
    return;
  }

  await api.sendMessage({ chat_id: chatId, text: 'Preferences are available through /settings, /notifications on|off, and /watchlist. Live signals require an authenticated external analysis service.' });
}
