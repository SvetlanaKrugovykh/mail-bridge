const { buttonsConfig } = require('../data/keyboard')
require('dotenv').config()
const { inputLineScene } = require('./inputLine')
const GROUP_ID = Number(process.env.GROUP_ID)
const SENDER = process.env.SENDER

async function mailComposeForm(bot, msg, webAppUrl) {
  const chatId = msg.chat.id
  const fromList = ["example1@mail.com", "example2@mail.com"]
  const toList = ["recipient1@mail.com", "recipient2@mail.com"]
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
}

async function usersTextInput(bot, msg, menuItem, selectedByUser) {
  try {
    const txtCommand = await inputLineScene(bot, msg)
    if (menuItem === '0_10') {
      if (!/^[^\s@]+@(lotok\.in\.ua|ito\.in\.ua)$/.test(txtCommand)) {
        await bot.sendMessage(msg.chat.id, 'Невірний формат <b>email</b>. Операцію скасовано\n', { parse_mode: 'HTML' })
        return selectedByUser
      }
      bot.sendMessage(msg.chat.id, 'Поверніться до меню та оберіть <b>Ввести Прізвище та ім`я</b>\n', { parse_mode: 'HTML' })
      selectedByUser = { ...selectedByUser, userEmail: txtCommand }
    } else if (menuItem === '0_11') {
      if (txtCommand.length < 5) {
        await bot.sendMessage(msg.chat.id, 'Незрозуміле введення <b>Прізвища та ім`я</b>. Операцію скасовано\n', { parse_mode: 'HTML' })
        return selectedByUser
      }
      await bot.sendMessage(msg.chat.id, 'Поверніться до меню та оберіть <b>Ввести номер телефону</b>\n', { parse_mode: 'HTML' })
      selectedByUser = { ...selectedByUser, userPIB: txtCommand }
    } else if (menuItem === '0_12') {
      const newtxtCommand = txtCommand.replace(/\D/g, '')
      if (!/^\d{7,12}$/.test(newtxtCommand)) {
        await bot.sendMessage(msg.chat.id, 'Невірний формат <b>Номеру телефону</b>. Операцію скасовано\n', { parse_mode: 'HTML' })
        return selectedByUser
      }
      if (selectedByUser?.userEmail) await bot.sendMessage(msg.chat.id, 'Поверніться до меню та оберіть <b>Зареєструвати користувача</b>\n', { parse_mode: 'HTML' })
      selectedByUser = { ...selectedByUser, userPhoneNumber: newtxtCommand }
      if (!selectedByUser?.userEmail) {
        await bot.sendMessage(msg.chat.id, 'Поверніться до меню та оберіть <b>Ввести email</b>\n', { parse_mode: 'HTML' })
      }
    }
    return selectedByUser
  } catch (err) {
    console.log(err)
    return selectedByUser
  }
}

async function mailCompose(bot, msg, selectedByUser) {
  try {
    if (!selectedByUser?.userEmail) {
      await bot.sendMessage(msg.chat.id, 'Не заповнено Email. Операцію скасовано\n', { parse_mode: 'HTML' })
      return
    }
    if (!selectedByUser?.userPIB) {
      await bot.sendMessage(msg.chat.id, 'Не заповнені прізвище та ім`я. Операцію скасовано\n', { parse_mode: 'HTML' })
      return
    }
    if (!selectedByUser?.userPhoneNumber) {
      await bot.sendMessage(msg.chat.id, 'Не заповнен ермер телефону. Операцію скасовано\n', { parse_mode: 'HTML' })
      return
    }

    const data = {
      email: selectedByUser?.userEmail,
      PIB: selectedByUser?.userPIB,
      phoneNumber: selectedByUser?.userPhoneNumber,
      contract: '',
      address: '',
    }

    console.log(data)
    await singUpDataSave(bot, msg.chat.id, data)
  } catch (err) {
    console.log(err)
  }
}

module.exports = { mailComposeForm, usersTextInput, mailCompose }


