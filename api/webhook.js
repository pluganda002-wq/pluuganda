/**
 * Telegram webhook — set with:
 * https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WEB_APP_URL>/api/webhook
 */
import { Bot, InlineKeyboard } from "grammy";

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

export async function POST(request) {
  if (!token || !webAppUrl) {
    return Response.json({ error: "BOT_TOKEN or WEB_APP_URL not configured" }, { status: 503 });
  }

  const bot = new Bot(token);
  const keyboard = new InlineKeyboard().webApp(
    "Open PLU BOT — Connect. Participate. Build Uganda.",
    webAppUrl
  );

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Karibu to *PLU BOT* — the Patriotic League of Uganda digital platform.\n\n" +
        "Tap below to open the Mini App.",
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply("Use /start to open the PLU Mini App.", { reply_markup: keyboard });
  });

  const update = await request.json();
  await bot.handleUpdate(update);
  return Response.json({ ok: true });
}
