///Токены
const  { telegramToken, daToken } = require("./config.json");
//Event Id
let eventId = null;

///TELEGRAM
const { Telegraf } = require('telegraf');
const bot = new Telegraf(telegramToken);

//--Запуск бота
bot.launch(
{dropPendingUpdates: true,},
console.log("Telegram bot started"));

//--команда для получения user id
bot.hears('/id', (ctx) => ctx.reply(`Ваш id: ${ctx.message.from.id}`));

//--Адресат
const channel = ""; //id-пользователя || идентификатор канала/чата
const threadId = ""; //id ветки/топика/трэда для супергрупп

///SOCKET DA
const socket = require('socket.io-client')
.connect("wss://socket.donationalerts.ru:443", { transports: ["websocket"] },
{reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: Infinity    
});
  socket.emit('add-user', {
  token: daToken,
  type: "minor"
});

//Connect
socket.on('connect', function(data){
    console.log('Connected to Donation Alerts');
});
//Error
socket.on("connect_error", (err) => {
    console.error(`Donation Alerts Connection Error! ${err.message}`);
    process.exit(0);
});
//Disconnect
socket.on('disconnect', () => {
    console.log('Donation Alerts Disconnected!');
    process.exit(0);
});

///Отлов событий
socket.on('donation', function(msg){
    
let event = JSON.parse(msg);
//console.log(event)

//--DONATION
if (event.alert_type === '1' || event.alert_type === 1) { 
    if (eventId === event.id) {return} //противодействие глюку с двойной отправкой события (глюк, который рандомно случается)
    if (event.username === null){ event.username = 'Аноним'}
    eventId = event.id
console.log(`${event.username} донатит ${event.amount_formatted} ${event.currency} и говорит: "${event.message}"`);
bot.telegram.sendMessage(channel, `${event.username} донатит ${event.amount_formatted} ${event.currency} и говорит: "${event.message}"`);
//Для супер-групп с указанием id ветки/топика
//bot.telegram.sendMessage(channel, `${event.username} донатит ${event.amount_formatted} ${event.currency} и говорит: "${event.message}"`, {message_thread_id: threadId});
    }
});
