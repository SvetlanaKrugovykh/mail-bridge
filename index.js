require('dotenv').config()
const { handler } = require('./src/controllers/switcher')
const menu = require('./src/modules/common_menu')
const { bot } = require('./globalBuffer')
const { isThisGroupId } = require('./src/modules/bot')
const mF = require('./src/controllers/toMailForm')

bot.on('message', async (msg) => {

  const chatId = msg.chat.id

  if (await isThisGroupId(bot, msg.chat.id, msg)) return

  if (msg.text === '/start') {
    console.log(new Date())
    console.log(msg.chat)
    await menu.commonStartMenu(bot, msg, true)
    return
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      console.log(data)
      await bot.sendMessage(chatId, 'MAil composed!')
      await bot.sendMessage(chatId, 'From: ' + data?.from)
      await bot.sendMessage(chatId, 'To: ' + data?.to)
      return
    } catch (e) {
      console.log(e)
    }
  }

  await handler(bot, msg, undefined)
})

module.exports = { bot }