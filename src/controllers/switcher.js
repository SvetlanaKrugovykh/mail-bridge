const { buttonsConfig } = require('../data/keyboard')
const menu = require('../modules/common_menu')
const { mailComposeForm } = require('./toMailForm')
const { globalBuffer, selectedByUser } = require('../../globalBuffer')
const { sendMail } = require('../modules/mailer')
require('dotenv').config()

const webAppUrl = 'https://' + process.env.WEB_APP_URL

function getCallbackData(text) {
  try {
    for (const buttonSet of Object.values(buttonsConfig)) {
      for (const langButtons of Object.values(buttonSet.buttons)) {
        for (const buttonRow of langButtons) {
          for (const button of buttonRow) {
            if (button.text === text) {
              return button.callback_data
            }
          }
        }
      }
    }
    return null
  } catch (error) { console.log(error) }
}

async function handler(bot, msg) {
  const chatId = msg?.chat?.id
  if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}
  if (selectedByUser[chatId] === undefined) selectedByUser[chatId] = {}

  if (!chatId || !msg?.text) return

  const data = getCallbackData(msg.text)
  if (!data) return

  if (!globalBuffer[chatId]) globalBuffer[chatId] = {}

  console.log('The choice is:', data)

  switch (data) {
    case '0_2':
      await menu.notTextScene(bot, msg)
      break
    case '0_3':
      await mailComposeForm(bot, msg, webAppUrl)
      break
    case '0_7':
      await mailComposeForm(bot, msg, webAppUrl, 'reply')
      break
    case '0_5':
      await sendMail(chatId)
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
      break
  }
}

module.exports = { handler }