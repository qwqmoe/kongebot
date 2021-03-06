if (!process.env.BOT_TOKEN) {
  const path = require('path')
  const envpath = path.resolve(__dirname, '.env')
  require('dotenv').config({ path: envpath })
}
const Telegraf = require('telegraf')
const rateLimit = require('telegraf-ratelimit')
const GraphemeSplitter = require('grapheme-splitter');
const splitter = new GraphemeSplitter();

// generate id for result
function hash(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function split(str) {
  return splitter.splitGraphemes(str).join(' ')
}

// Set limit to 1 message per 0.5 seconds
const limitConfig = {
  window: 500,
  limit: 1,
  onLimitExceeded: (ctx, next) => console.log('Rate limit exceeded')
}

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('你 打 字 带 空 格？\r\n 直接发送要转换的消息，或者在inline模式输入文字'))
bot.on('text', (ctx) => ctx.reply(split(ctx.message.text)))
bot.on('callback_query', (ctx) => ctx.answerCbQuery())
bot.on('inline_query', (ctx) => {
  const result = []
  let str = ctx.inlineQuery.query
  result.push({
    type: 'article',
    id: hash(str),
    title: '全部都来个空！',
    description: split(str).substring(0,30),
    input_message_content: {
      message_text: split(str)
    }
  })
  // Using shortcut
  ctx.answerInlineQuery(result)
})

module.exports = bot