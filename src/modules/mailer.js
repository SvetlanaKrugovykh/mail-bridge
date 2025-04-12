const nodemailer = require('nodemailer')
const { selectedByUser } = require('../../globalBuffer')
const tg_output = require('./tg_output')
require('dotenv').config()

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env

module.exports.sendMail = async function (chatId) {
  try {
    const message = selectedByUser[chatId]?.mailData
    if (!message?.from || !message?.to || !message?.subject || !message?.content) {
      await tg_output.sendMessage(chatId, "Error sending mail: missing data")
      selectedByUser[chatId].AttachmentFileNames = []
      selectedByUser[chatId].mailData = {}
      console.error("Error sending mail: missing data")
      return false
    }

    const recipients = message.to.includes(',')
      ? message.to.split(',').map(email => email.trim())
      : message.to

    console.log("Sending mail to:", recipients)

    let transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD
      }
    })

    message.attachments = selectedByUser[chatId].AttachmentFileNames

    const letter = {
      from: message.from,
      to: recipients,
      subject: message.subject,
      text: message.content,
      attachments: message.attachments
    }

    let info = await transporter.sendMail(letter)

    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

    selectedByUser[chatId].AttachmentFileNames = []
    selectedByUser[chatId].mailData = {}
    return true
  } catch (error) {
    await tg_output.sendMessage(chatId, "Error sending mail: " + error.message)
    selectedByUser[chatId].AttachmentFileNames = []
    selectedByUser[chatId].mailData = {}
    console.log("Error sending mail:", error.response || error.message)
    return false
  }
}