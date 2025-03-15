const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { menuStarter } = require('../controllers/clientsAdmin')
require('dotenv').config()
const { buttonsConfig, texts } = require('../data/keyboard')
const { users } = require('../users/users.model')
const { selectedByUser } = require('../../globalBuffer')

module.exports.commonStartMenu = async function (bot, msg) {
  console.log(`/start at ${new Date()} tg_user_id: ${msg.chat.id}`)
  const adminUser = users.find(user => user.id === msg.chat.id)
  if (adminUser) {
    await menuStarter(bot, msg, buttonsConfig["starterButtons"])
  } else {
    await blockMenu(bot, msg)
  }
}

module.exports.notTextScene = async function (bot, msg, lang = "en", toSend = true, voice = false) {

  const GROUP_ID = msg.chat.id
  if (!selectedByUser[msg.chat.id]?.AttachmentFileNames) selectedByUser[msg.chat.id].AttachmentFileNames = []

  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, `<i>${texts[lang]['0_2']}\n</i>`, { parse_mode: "HTML" })

    const collectedMessages = []

    const handleMessage = async (message) => {
      let fileId = ''
      let fileExtension = ''
      let originalFileName = ''
      if (message.chat.id === chatId) {
        if (message.text) {
          collectedMessages.push({ type: 'text', content: message.text })
        } else if (message.photo) {
          fileId = message.photo[message.photo.length - 1].file_id
          fileExtension = 'jpg'
          originalFileName = `photo_${new Date().getTime()}.jpg`
          collectedMessages.push({ type: 'photo', fileId })
        } else if (message.document) {
          fileId = message.document.file_id
          fileExtension = path.extname(message.document.file_name)
          originalFileName = message.document.file_name
          collectedMessages.push({ type: 'document', fileId })
        } else if (message.audio) {
          fileId = message.audio.file_id
          fileExtension = path.extname(message.audio.file_name)
          originalFileName = message.audio.file_name
          collectedMessages.push({ type: 'audio', fileId })
        } else if (message.voice) {
          fileId = message.voice.file_id
          fileExtension = 'ogg'
          originalFileName = `voice_${new Date().getTime()}.ogg`
          collectedMessages.push({ type: 'voice', fileId })
        }
      }
      if (fileId !== '') {
        const dirPath = process.env.TEMP_DOWNLOADS_CATALOG
        fs.mkdirSync(dirPath, { recursive: true })
        const filePath = path.join(dirPath, `${fileId}${fileExtension}`)
        const attachment = {
          filename: originalFileName,
          path: filePath
        }
        selectedByUser[chatId].AttachmentFileNames.push(attachment)
        await downloadFile(bot, fileId, filePath)
      }
    }

    bot.on('message', handleMessage)

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        bot.removeListener('message', handleMessage)
        resolve()
      }, 30000)

      bot.on('message', (message) => {
        if (message.chat.id === chatId) {
          clearTimeout(timeout)
          bot.removeListener('message', handleMessage)
          resolve()
        }
      })
    })

    for (const message of collectedMessages) {
      if (message.type === 'text') {
        if (toSend) await bot.sendMessage(GROUP_ID, `Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):\n${message.content}`, { parse_mode: "HTML" })
      } else {
        if (toSend) await bot.sendMessage(GROUP_ID, `Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):`, { parse_mode: "HTML" })

        if (message.type === 'photo') {
          await bot.sendPhoto(GROUP_ID, message.fileId)
        } else if (message.type === 'document') {
          await bot.sendDocument(GROUP_ID, message.fileId)
        } else if (message.type === 'audio') {
          await bot.sendAudio(GROUP_ID, message.fileId)
        } else if (message.type === 'voice') {
          const dirPath = process.env.TEMP_DOWNLOADS_CATALOG
          fs.mkdirSync(dirPath, { recursive: true })
          const filePath = path.join(dirPath, `${message.fileId}.ogg`)
          await downloadFile(bot, message.fileId, filePath)
          return filePath
        }
      }
    }

  } catch (err) {
    console.log(err)
  }
}


async function blockMenu(bot, msg, lang = "en") {
  await bot.sendMessage(msg.chat.id, texts[lang]['block'], {})
}

async function downloadFile(bot, fileId, dest) {
  const file = await bot.getFile(fileId)
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest)
    response.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

module.exports.downloadPDF = async function (bot, msg, lang = 'en') {
  try {
    const filePath = path.join(__dirname, '../../assets/pdf', `${lang}.pdf`)
    await bot.sendDocument(msg.chat.id, filePath, {}, {
      filename: `${lang}.pdf`,
      contentType: 'application/pdf'
    })
  } catch (err) {
    console.log(err)
    await bot.sendMessage(msg.chat.id, texts[lang]['0_1'])
  }
}
