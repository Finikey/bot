// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Привет, Друг!');
//   });
// export {Calendar} from 'Calendar.js'
const TelegramApi = require('node-telegram-bot-api')
const mysql = require('mysql');

const token = '7157748155:AAHR3UF4kSm6E5iuQgFGYgZi6le27bJyCIU'

const bot = new TelegramApi(token, { polling: true })

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'barberia'
};

// Создание соединения
const connection = mysql.createConnection(dbConfig);

// Подключение к базе данных
connection.connect();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Предположим, что пользователь выбирает опцию, отправляя "/choose_option"
    if (text === '/start') {
        bot.sendMessage(chatId, 'Введите свой выбор:');
        bot.on('message', async (msg) => {
            const choice = msg.text;

            // Здесь вы можете выполнить SQL-запрос для вставки выбора пользователя в базу данных
            const insertSql = `INSERT INTO choices (user_id, choice) VALUES (${chatId}, '${choice}')`;

            connection.query(insertSql, (err, result) => {
                if (err) {
                    console.error('Ошибка при вставке данных:', err);
                    bot.sendMessage(chatId, 'Произошла ошибка при сохранении вашего выбора.');
                } else {
                    bot.sendMessage(chatId, 'Ваш выбор был успешно сохранен.');
                }
            });

            // Отключение обработчика сообщений после выполнения операции
            bot.removeListener('message', bot.on('message'));
        });
    }

    if (text === '/get_data') {
        // Запрос данных из базы данных
        const sqlQuery = "SELECT * FROM tovar"; // Замените 'your_table' на имя вашей таблицы
        connection.query(sqlQuery, (err, results) => {
            if (err) {
                console.error('Ошибка при запросе данных:', err);
                bot.sendMessage(chatId, 'Произошла ошибка при получении данных.');
            } else {
                // Формирование строки с данными для отправки
                let dataString = '';
                results.forEach(row => {
                    dataString += `id: ${row.id}, name: ${row.name}\n`; // Измените поля в соответствии с вашей структурой данных
                });

                // Отправка данных пользователю
                bot.sendMessage(chatId, dataString);
            }
        });
    }

});

// const gameOptions = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '3' }, { text: '4', callback_data: '4' }]
//         ]
//     })
// }

// bot.command('choose_date', (ctx) => {
//     ctx.reply('Выберите дату:', {
//         reply_markup: {
//             inline_keyboard: [
//                 [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }],
//                 [{ text: '4', callback_data: '4' }, { text: '5', callback_data: '5' }, { text: '6', callback_data: '6' }],
//                 [{ text: '7', callback_data: '7' }, { text: '8', callback_data: '8' }, { text: '9', callback_data: '9' }],
//                 [{ text: '10', callback_data: '10' }, { text: '11', callback_data: '11' }, { text: '12', callback_data: '12' }],
//                 [{ text: '13', callback_data: '13' }, { text: '14', callback_data: '14' }, { text: '15', callback_data: '15' }],
//                 [{ text: '16', callback_data: '16' }, { text: '17', callback_data: '17' }, { text: '18', callback_data: '18' }],
//                 [{ text: '19', callback_data: '19' }, { text: '20', callback_data: '20' }, { text: '21', callback_data: '21' }],
//                 [{ text: '22', callback_data: '22' }, { text: '23', callback_data: '23' }, { text: '24', callback_data: '24' }],
//                 [{ text: '25', callback_data: '25' }, { text: '26', callback_data: '26' }, { text: '27', callback_data: '27' }],
//                 [{ text: '28', callback_data: '28' }, { text: '29', callback_data: '29' }, { text: '30', callback_data: '30' }],
//                 [{ text: '31', callback_data: '31' }]
//             ]
//         }
//     });
// });

// bot.action(/.+/, (ctx) => {
//     const chosenDate = ctx.match[0];
//     ctx.answerCbQuery(`Вы выбрали дату: ${chosenDate}`);
// });

// import {Calendar} from 'telegram-inline-calendar';
// process.env.NTBA_FIX_319 = 1;
// const bota = new TelegramBot(TOKEN, {polling: true});
// const calendar = new Calendar(bota, {
//     date_format: 'DD-MM-YYYY',
//     language: 'en'
// });


// bota.onText(/\/start/, (msg) => calendar.startNavCalendar(msg));

// bota.on("callback_query", (query) => {
//     if (query.message.message_id == calendar.chats.get(query.message.chat.id)) {
//         var res;
//         res = calendar.clickButtonCalendar(query);
//         if (res !== -1) {
//             bota.sendMessage(query.message.chat.id, "You selected: " + res);
//         }
//     }
// });







// const start = () => {

//     bot.setMyCommands([
//         { command: '/start', description: 'начало' },
//         { command: '/info', description: 'информация' },
//         { command: '/add', description: 'добавить' },
//     ])


//     bot.on('message', msg => {
//         console.log(msg)

//     });

//     bot.on('message', async msg => {
//         const text = msg.text;
//         const chatId = msg.chat.id;

//         if (text === '/start') {
//             return bot.sendMessage(chatId, `Добро пожаловать ${msg.from.first_name}!`).then(res => res).catch(err => console.log(err));
//         }

//         if (text === '/info') {
//             return bot.sendMessage(chatId, `Тебя зовут: ${msg.from.first_name}`).then(res => res).catch(err => console.log(err));
//         }

//         if (text === 'Привет') {
//             return bot.sendMessage(chatId, `ку ${msg.from.first_name}`).then(res => res).catch(err => console.log(err));
//         }

//         if (text === 'Пока') {
//             return bot.sendMessage(chatId, `До свидания ${msg.from.first_name}`).then(res => res).catch(err => console.log(err));
//         }

//         if (text === '/add') {
//             // await bot.sendMessage(chatId, `Выбери дату записи`);
//             return bot.sendMessage(chatId, `Выбери дату записи`, gameOptions).then(res => res).catch(err => console.log(err));
//         }

//         // if (text == '/add')

//         await bot.sendMessage(chatId, `Я тебя не понимаю`).then(res => res).catch(err => console.log(err));
//         return bot.sendSticker(chatId, `https://stickerpacks.ru/wp-content/uploads/2024/03/nabor-stikerov-grustnyj-homjak-1.webp`).then(res => res).catch(err => console.log(err));

//     });

// }


// start()