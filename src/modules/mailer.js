const nodemailer = require('nodemailer')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../../globalBuffer')
require('dotenv').config()

const { MAIL_HOST, MAIL_PORT } = process.env

module.exports.sendMail = async function (chatId) {
  try {
    const message = selectedByUser[chatId]?.mailData
    if (!message?.from || !message?.to || !message?.subject || !message?.content) {
      console.error("Error sending mail: missing data")
      return false
    }

    let transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false,
      auth: {
        user: message.from,
        pass: message?.password || process.env.MAIL_PASSWORD
      }
    })

    message.attachments = selectedByUser[chatId].AttachmentFileNames.map(file => ({
      filename: path.basename(file.path),
      path: file.path
    }))

    const letter = {
      from: message.from,
      to: message.to,
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
    console.error("Error sending mail:", error)
    return false
  }
}