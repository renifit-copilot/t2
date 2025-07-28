import { validate, parse } from '@telegram-apps/init-data-node';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN!;
if (!TELEGRAM_BOT_TOKEN) throw new Error('BOT_TOKEN is not set');

export function verifyTelegramInitData(initData: string) {
  // Если валидация пройдена — вернём распарсенные данные
  validate(initData, TELEGRAM_BOT_TOKEN);
  return parse(initData);
}
