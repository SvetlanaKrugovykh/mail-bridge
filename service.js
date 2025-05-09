const Service = require('node-windows').Service
const path = require('path')

const svc = new Service({
  name: 'MailBridgeBot',
  description: 'Telegram bot for MailBridge',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  logpath: path.join(__dirname, 'logs'),
  logfile: path.join(__dirname, 'logs', 'service.log'),
  errorfile: path.join(__dirname, 'logs', 'error.log')
})

svc.on('install', () => {
  console.log('Service installed successfully!')
  svc.start()
})

svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!')
})

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed.')
})

svc.on('start', () => {
  console.log('Service started successfully!')
})

svc.on('stop', () => {
  console.log('Service stopped.')
})

if (process.argv.includes('--install')) {
  svc.install()
}

if (process.argv.includes('--uninstall')) {
  svc.uninstall()
}