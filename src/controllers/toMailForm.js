const { selectedByUser } = require('../../globalBuffer')
const { buttonsConfig } = require('../data/keyboard')
require('dotenv').config()
const { users } = require('../users/users.model')

async function mailComposeForm(bot, msg, webAppUrl, type = 'compose') {

  const chatId = msg.chat.id
  try {
    const USER = users.find(user => user.id === chatId)
    let fromList, toList


    if (type === 'compose') {
      fromList = USER.fromList
      toList = USER.toList
    } else {
      fromList = selectedByUser[chatId]?.mailData?.fromList
      toList = selectedByUser[chatId]?.mailData?.toList
    }
    const fromListParam = encodeURIComponent(JSON.stringify(fromList))
    const toListParam = encodeURIComponent(JSON.stringify(toList))
    const url = `${webAppUrl}/mail-form/?fromList=${fromListParam}&toList=${toListParam}`

    await bot.sendMessage(chatId, 'A button will appear below, fill out the form', {
      reply_markup: {
        keyboard: [
          [{ text: '📩 Compose the mail', web_app: { url } }],
          [{ text: '🏠', callback_data: '0_4' }]
        ],
        resize_keyboard: true
      }
    })
  } catch (error) { console.log(error) }
}

module.exports = { mailComposeForm }


