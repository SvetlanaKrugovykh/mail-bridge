const fs = require('fs')
const path = require('path')
const cron = require('node-cron')
const { bot } = require('../../index')
require('dotenv').config()

const LOG_FILE_PATH = process.env.LOG_FILE_PATH
const GROUP_ID = process.env.GROUP_ID
const TIME_OFFSET = 3 * 60 * 60 * 1000

let lastProcessedTimestamp = 0

const analyzeLogFile = () => {
  try {
    const logData = fs.readFileSync(LOG_FILE_PATH, 'utf-8')
    const logLines = logData.split('\n')

    const now = Date.now() - TIME_OFFSET
    const tenMinutesAgo = now - 10 * 60 * 1000

    const errorsToReport = []
    let captureNextLines = false
    let capturedLines = []

    logLines.forEach((line) => {
      const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/)
      if (timestampMatch) {
        const logTimestamp = new Date(timestampMatch[1]).getTime()

        if (logTimestamp > lastProcessedTimestamp && logTimestamp >= tenMinutesAgo) {
          if (line.includes('error: Error sending mail to')) {
            captureNextLines = true
            capturedLines = [line]
          } else if (captureNextLines) {
            capturedLines.push(line)
            if (capturedLines.length >= 10) {
              errorsToReport.push(capturedLines.join('\n'))
              captureNextLines = false
              capturedLines = []
            }
          }
        }
      }
    })

    errorsToReport.forEach(async (errorReport) => {
      await bot.sendMessage(GROUP_ID, `<pre>🖌️(time +3 hours!)${errorReport}</pre>`, { parse_mode: 'HTML' })
    })

    if (errorsToReport.length > 0) {
      lastProcessedTimestamp = now
    }
  } catch (error) {
    console.error('Error analyzing log file:', error.message)
  }
}

cron.schedule('*/10 * * * *', analyzeLogFile)

console.log('Log monitoring started...')