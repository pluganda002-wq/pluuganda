/**
 * Minimal PLU BOT — opens the Mini App from /start.
 * Set BOT_TOKEN and WEB_APP_URL in the environment.
 */
import { Bot, InlineKeyboard } from "grammy";

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

if (!token) {
  console.error("Missing BOT_TOKEN");
  process.exit(1);
}
if (!webAppUrl) {
  console.error("Missing WEB_APP_URL (HTTPS URL of the deployed mini app)");
  process.exit(1);
}

const bot = new Bot(token);

const keyboard = new InlineKeyboard().webApp(
  "Open PLU BOT — Connect. Participate. Build Uganda.",
  webAppUrl
);

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Karibu to *PLU BOT* — the Patriotic League of Uganda digital platform.\n\n" +
      "• Register & verify membership\n" +
      "• Presidential endorsements\n" +
      "• Community service & youth programmes\n" +
      "• Fight corruption — secure reporting\n" +
      "• UGo Ride, Tugende, PLU TV & more\n\n" +
      "Tap the button below to open the app.",
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply("Use /start to open the PLU Mini App.", { reply_markup: keyboard });
});

bot.start({
  onStart: (info) => console.log(`PLU BOT running as @${info.username}`),
});
