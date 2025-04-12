const axios = require('axios')
require('dotenv').config()

module.exports.sendMessage = async function (chatId, message) {
  const apiKey = process.env.TELEGRAM_BOT_TOKEN
  try {
    const response = await axios.post(`https://api.telegram.org/bot${apiKey}/sendMessage`, {
      chat_id: chatId,
      text: message,
    })

    if (response.status === 200) {
      console.log('Message sent to the Telegram group successfully!')
    } else {
      console.error('Error sending message to the Telegram group:', response.statusText)
    }
  } catch (error) {
    console.error('Error sending message to the Telegram group:', error.message)
  }
}


