import { validate, parse } from '@telegram-apps/init-data-node/web';

function getBotToken() {
  // В middleware используем NEXT_PUBLIC_BOT_TOKEN
  if (process.env.NEXT_PUBLIC_BOT_TOKEN) {
    return process.env.NEXT_PUBLIC_BOT_TOKEN;
  }
  
  // На сервере используем BOT_TOKEN
  if (process.env.BOT_TOKEN) {
    return process.env.BOT_TOKEN;
  }

  throw new Error('Bot token not configured. Set BOT_TOKEN in .env.local');
}

export function verifyTelegramInitData(initData: string) {
  const token = getBotToken();
  
  // Если валидация пройдена — вернём распарсенные данные
  validate(initData, token);
  return parse(initData);
}
