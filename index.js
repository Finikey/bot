const TelegramBot = require('node-telegram-bot-api');

const token = '7157748155:AAHR3UF4kSm6E5iuQgFGYgZi6le27bJyCIU';
const bot = new TelegramBot(token, {polling: true});
const mysql = require('mysql');
const chatId = 'YOUR_CHAT_ID';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bar',
    charset: 'utf8mb4'
  });
  
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
  });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Привет Я помогу тебе забронировать стрижку", {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Записаться', callback_data: 'book_appointment' }],
        [{ text: 'Cancel', callback_data: 'cancel' }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const { data } = query;
  const chatId = query.message.chat.id;



  if (data === 'book_appointment') {
    bot.sendMessage(chatId, "Выберите дату:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: '24.05.2023', callback_data: 'date_24.05.2023' },{ text: '25.05.2023', callback_data: 'date_25.05.2023' }],
          [{ text: '26.05.2023', callback_data: 'date_25.05.2023' },{ text: '27.05.2023', callback_data: 'date_25.05.2023' }],
          [{ text: '28.05.2023', callback_data: 'date_26.05.2023' },{ text: '29.05.2023', callback_data: 'date_25.05.2023' }],
          [{ text: '30.05.2023', callback_data: 'date_25.05.2023' },{ text: '31.05.2023', callback_data: 'date_25.05.2023' }]
        ]
      }
    });
  } else if (data.startsWith('date_')) {
    const date = data.replace('date_', '');
    bot.sendMessage(chatId, `Вы выбрали дату ${date}. Теперь выберите время:`);
    bot.sendMessage(chatId, "Выберите время:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: '10:00', callback_data: `time_10:00_${date}` },{ text: '10:30', callback_data: `time_10:30_${date}` }],
          [{ text: '11:00', callback_data: `time_11:00_${date}` },{ text: '11:30', callback_data: `time_11:30_${date}` }],
          [{ text: '12:00', callback_data: `time_12:00_${date}` },{ text: '12:30', callback_data: `time_12:30_${date}` }]
        ]
      }
    });
  } else if (data.startsWith('time_')) {
    const [_, time, date] = data.split('_');
    bot.sendMessage(chatId, `Вы выбрали время ${time} на дату ${date}. Теперь выберите вид стрижки:`);
    bot.sendMessage(chatId, "Выберите вид стрижки:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Мужская стрижка', callback_data: `haircut_Мужская стрижка_${time}_${date}` }],
          [{ text: 'Женская стрижка', callback_data: `haircut_Женская стрижка_${time}_${date}` }],
          [{ text: 'Детская стрижка', callback_data: `haircut_Детская стрижка_${time}_${date}` }]
        ]
      }
    });
  } else if (data.startsWith('haircut_')) {
    const [_, haircut, time, date] = data.split('_');
    bot.sendMessage(chatId, `Вы выбрали ${haircut} на ${time} ${date}.`);

    
    bot.sendMessage(chatId, "Выберите парикмахера:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Иван', callback_data: `barber_Иван_${haircut}_${time}_${date}` }],
          [{ text: 'Настя', callback_data: `barber_Настя_${haircut}_${time}_${date}` }],
          [{ text: 'Олег', callback_data: `barber_Олег_${haircut}_${time}_${date}` }]
        ]
      }
    });

} else if (data.startsWith('barber_')) {
    const [_, barber, haircut, time, date] = data.split('_');
    bot.sendMessage(chatId, `Вы выбрали ${barber} для ${haircut} на ${time} ${date}.`);
    bot.sendMessage(chatId, "Подтверждаете ли вы выбор?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Да', callback_data: `confirm_${barber}_${haircut}_${time}_${date}` }],
          [{ text: 'Нет', callback_data: `cancel` }]
        ]
      }
    });
  } else if (data.startsWith('confirm_')) {
    const [_, barber, haircut, time, date] = data.split('_');
    bot.sendMessage(chatId, `Ваша запись на ${haircut} у парикмахера ${barber} на ${time} ${date} подтверждена!`);

    bot.getChat(chatId).then((chat) => {
        const firstName = chat.first_name;
        const username  = chat.username ;
        const sql = `INSERT INTO appointments (chat_id, first_name, username,  barber, haircut, time, date) VALUES (${chatId}, '${firstName}', '${username}', '${barber}', '${haircut}', '${time}', '${date}')`;
        connection.query(sql, (err, result) => {
          if (err) throw err;
          console.log(`Appointment saved to database: ${result.insertId}`);
        });
      });
  } else if (data === 'cancel') {
    bot.sendMessage(chatId, "Запись отменена.");
  }
 


  
  // ...

  
 

});



// const TelegramApi = require('node-telegram-bot-api');
// const mysql = require('mysql');

// // Initialize the MySQL connection
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'barbershop'
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to MySQL database.');
// });

// // Initialize the Telegram bot
// const bot = new TelegramApi('7157748155:AAHR3UF4kSm6E5iuQgFGYgZi6le27bJyCIU');

// // Define the available dates, times, haircuts, and barbers
// const availableDates = ['2023-05-18', '2023-05-19', '2023-05-20'];
// const availableTimes = ['10:00', '11:00', '12:00', '13:00', '14:00'];
// const availableHaircuts = ['Men\'s Haircut', 'Women\'s Haircut', 'Kids\' Haircut'];
// const availableBarbers = ['John', 'Jane', 'Bob'];

// // Define the main menu
// const mainMenu = {
//   text: 'Welcome to the Barbershop! Please select an option:',
//   options: [
//     { text: 'Book an appointment', callback_data: 'book_appointment' },
//     { text: 'Cancel', callback_data: 'cancel' }
//   ]
// };

// // Define the booking menu
// const bookingMenu = {
//   text: 'Please select the following options:',
//   options: [
//     { text: 'Date:', callback_data: 'date' },
//     { text: 'Time:', callback_data: 'time' },
//     { text: 'Haircut:', callback_data: 'haircut' },
//     { text: 'Barber:', callback_data: 'barber' }
//   ]
// };

// // Define the callback query handler
// bot.on('callback_query', (query) => {
//   const { data, message } = query;

//   // Handle the main menu options
//   if (data === 'book_appointment') {
//     bot.sendMessage(message.chat.id, bookingMenu.text, {
//       reply_markup: {
//         inline_keyboard: bookingMenu.options.map(option => [
//           { text: option.text, callback_data: option.callback_data }
//         ])
//       }
//     });
//   }

//   // Handle the booking menu options
//   else {
//     const { chat } = message;
//     const { text } = query.message.text;

//     switch (data) {
//       case 'date':
//         const availableDate = availableDates[Math.floor(Math.random() * availableDates.length)];
//         bot.sendMessage(chat.id, `Selected date: ${availableDate}`);
//         break;

//       case 'time':
//         const availableTime = availableTimes[Math.floor(Math.random() * availableTimes.length)];
//         bot.sendMessage(chat.id, `Selected time: ${availableTime}`);
//         break;

//       case 'haircut':
//         const availableHaircut = availableHaircuts[Math.floor(Math.random() * availableHaircuts.length)];
//         bot.sendMessage(chat.id, `Selected haircut: ${availableHaircut}`);
//         break;

//       case 'barber':
//         const availableBarber = availableBarbers[Math.floor(Math.random() * availableBarbers.length)];
//         bot.sendMessage(chat.id, `Selected barber: ${availableBarber}`);
//         break;

//       case 'cancel':
//         bot.sendMessage(chat.id, 'Your booking has been canceled.');
//         break;
//     }
//   }
// });


// bot.onText(/\/start/, (msg) =>



// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Привет, Друг!');
//   });
// export {Calendar} from 'Calendar.js'
// const TelegramApi = require('node-telegram-bot-api');
// const mysql = require('mysql');

// // Initialize the MySQL connection
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'barbershop'
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to MySQL database.');
// });

// // Initialize the Telegram bot
// const bot = new TelegramApi('7157748155:AAHR3UF4kSm6E5iuQgFGYgZi6le27bJyCIU');

// // Define the available dates, times, haircuts, and barbers
// const availableDates = ['2023-05-18', '2023-05-19', '2023-05-20'];
// const availableTimes = ['10:00', '11:00', '12:00', '13:00', '14:00'];
// const availableHaircuts = ['Men\'s Haircut', 'Women\'s Haircut', 'Kids\' Haircut'];
// const availableBarbers = ['John', 'Jane', 'Bob'];

// // Define the main menu


// bot.onText(/\/start/, (msg) => {
// const chatId = msg.chat.id;
//     bot.sendMessage(chatId, "Привет Я помогу тебе забронировать стрижку.");
//     options: [
//         { text: 'Book an appointment', callback_data: 'book_appointment' },
//         { text: 'Cancel', callback_data: 'cancel' }
//       ]
// });

// // Define the booking menu
// const bookingMenu = {
//   text: 'Please select the following options:',
//   options: [
//     { text: 'Date:', callback_data: 'date' },
//     { text: 'Time:', callback_data: 'time' },
//     { text: 'Haircut:', callback_data: 'haircut' },
//     { text: 'Barber:', callback_data: 'barber' }
//   ]
// };

// // Define the callback query handler
// bot.on('callback_query', (query) => {
//   const { data, message } = query;

//   // Handle the main menu options
//   if (data === 'book_appointment') {
//     bot.sendMessage(message.chat.id, bookingMenu.text, {
//       reply_markup: {
//         inline_keyboard: bookingMenu.options.map(option => [
//           { text: option.text, callback_data: option.callback_data }
//         ])
//       }
//     });
//   }

//   // Handle the booking menu options
//   else {
//     const { chat } = message;
//     const { text } = query.message.text;

//     switch (data) {
//       case 'date':
//         const availableDate = availableDates[Math.floor(Math.random() * availableDates.length)];
//         bot.sendMessage(chat.id, `Selected date: ${availableDate}`);
//         break;

//       case 'time':
//         const availableTime = availableTimes[Math.floor(Math.random() * availableTimes.length)];
//         bot.sendMessage(chat.id, `Selected time: ${availableTime}`);
//         break;

//       case 'haircut':
//         const availableHaircut = availableHaircuts[Math.floor(Math.random() * availableHaircuts.length)];
//         bot.sendMessage(chat.id, `Selected haircut: ${availableHaircut}`);
//         break;

//       case 'barber':
//         const availableBarber = availableBarbers[Math.floor(Math.random() * availableBarbers.length)];
//         bot.sendMessage(chat.id, `Selected barber: ${availableBarber}`);
//         break;

//       case 'cancel':
//         bot.sendMessage(chat.id, 'Your booking has been canceled.');
//         break;
//     }
//   }
// });

// // Start the bot
// bot.startPolling()











// // Create a MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'barberia'
//   });
  
//   // Connect to MySQL
//   connection.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to MySQL');
//   });
  
//   // Handle incoming messages
//   bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
  
//     // Handle the /start command
//     if (msg.text === '/start') {
//       bot.sendMessage(chatId, 'Hi! Welcome to the Barber Shop. Please choose an option:', {
//         reply_markup: {
//           keyboard: [
//             ['Date', 'Time'],
//             ['Haircut', 'Specialist'],
//             ['Book Appointment', 'Cancel']
//           ]
//         }
//       });
//     }
  
//     // Handle other commands
//     else {
//       // Parse the user's choice
//       const choice = msg.text.toLowerCase();
  
//       // Handle the date option
//       if (choice === 'date') {
//         // Query the database for available dates
//         const sql = 'SELECT date FROM appointments WHERE available = 1';
//         connection.query(sql, (err, results) => {
//           if (err) throw err;
  
//           // Send the available dates to the user
//           bot.sendMessage(chatId, 'Available dates:', {
//             reply_markup: {
//               inline_keyboard: results.map(row => [
//                 { text: row.date, callback_data: row.date }
//               ])
//             }
//           });
//         });
//       }
  
//       // Handle the time option
//       else if (choice === 'time') {
//         // Query the database for available times
//         const sql = 'SELECT time FROM appointments WHERE available = 1';
//         connection.query(sql, (err, results) => {
//           if (err) throw err;
  
//           // Send the available times to the user
//           bot.sendMessage(chatId, 'Available times:', {
//             reply_markup: {
//               inline_keyboard: results.map(row => [
//                 { text: row.time, callback_data: row.time }
//               ])
//             }
//           });
//         });
//       }
  
//       // Handle the haircut option
//       else if (choice === 'haircut') {
//         // Send a list of haircuts to the user
//         bot.sendMessage(chatId, 'Choose a haircut:', {
//           reply_markup: {
//             keyboard: [
//               ['Fade', 'Undercut'],
//               ['Buzz Cut', 'Mohawk']
//             ]
//           }
//         });
//       }
  
//       // Handle the specialist option
//       else if (choice === 'specialist') {
//         // Send a list of specialists to the user
//         bot.sendMessage(chatId, 'Choose a specialist:', {
//           reply_markup: {
//             keyboard: [
//               ['John', 'Jane'],
//               ['Bob', 'Sally']
//             ]
//           }
//         });
//       }
  
//       // Handle the book appointment option
//       else if (choice === 'book appointment') {
//         // Get the user's selected date, time, haircut, and specialist
//         // and insert them into the database
//         // ...
  
//         // Send a confirmation

//       }
//     }
// })




// const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'barberia'
// };

// // Создание соединения
// const connection = mysql.createConnection(dbConfig);

// // Подключение к базе данных
// connection.connect((err) => {
//     if (err) {
//         console.error('Ошибка при подключении к базе данных:', err);
//         return;
//     }
//     console.log('Подключение к базе данных установлено');
// });

// let chooseOptionHandler;

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const text = msg.text;

//     if (text === '/start') {
//         bot.sendMessage(chatId, 'Введите свой выбор:');
//         chooseOptionHandler = (msg) => {
//             const choice = msg.text;

//             const insertSql = 'INSERT INTO choices (user_id, choice) VALUES (?, ?)';
//             connection.query(insertSql, [chatId, choice], (err, result) => {
//                 if (err) {
//                     console.error('Ошибка при вставке данных:', err);
//                     bot.sendMessage(chatId, 'Произошла ошибка при сохранении вашего выбора.');
//                 } else {
//                     bot.sendMessage(chatId, 'Ваш выбор был успешно сохранен.');
//                 }
//             });

//             bot.removeListener('message', chooseOptionHandler);
//         };
//         bot.on('message', chooseOptionHandler);
//     }

//     if (text === '/get_data') {
//         const sqlQuery = "SELECT * FROM tovar";
//         connection.query(sqlQuery, (err, results) => {
//             if (err) {
//                 console.error('Ошибка при запросе данных:', err);
//                 bot.sendMessage(chatId, 'Произошла ошибка при получении данных.');
//             } else {
//                 let dataString = '';
//                 results.forEach(row => {
//                     dataString += `id: ${row.id}, name: ${row.name}\n`;
//                 });

//                 bot.sendMessage(chatId, dataString);
//             }
//         });
//     }
// });

// // Закрытие соединения с базой данных
// process.on('exit', () => {
//     connection.end();
// });

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