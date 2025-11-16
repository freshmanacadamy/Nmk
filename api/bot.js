const TelegramBot = require('node-telegram-bot-api');

// Use webhooks for Vercel
const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });

// Set webhook URL (run this once)
const setWebhook = async () => {
  const webhookUrl = `${process.env.VERCEL_URL}/api/bot`;
  await bot.setWebHook(webhookUrl);
  console.log('Webhook set to:', webhookUrl);
};

// Your bot logic here
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log('Received message:', text);

  // Handle different commands
  switch (text) {
    case '/start':
      bot.sendMessage(chatId, '🤖 Welcome to my Telegram Bot!\n\nAvailable commands:\n/start - Show this message\n/help - Get help\n/info - Bot information\n/echo [text] - Echo your message');
      break;
    
    case '/help':
      bot.sendMessage(chatId, '🆘 Help Section:\n\nThis is a template bot running on Vercel serverless functions. You can customize it to add your own functionality!');
      break;
    
    case '/info':
      bot.sendMessage(chatId, 'ℹ️ Bot Information:\n\n• Framework: Node.js\n• Hosting: Vercel Serverless\n• Library: node-telegram-bot-api\n• Status: 🟢 Online');
      break;
    
    default:
      if (text.startsWith('/echo ')) {
        const echoText = text.substring(6);
        bot.sendMessage(chatId, `🔁 Echo: ${echoText}`);
      } else if (text.startsWith('/')) {
        bot.sendMessage(chatId, '❓ Unknown command. Type /start to see available commands.');
      } else {
        bot.sendMessage(chatId, `📝 You said: "${text}"\n\nTry using /help to see what I can do!`);
      }
  }
});

// Handle inline queries
bot.on('inline_query', (query) => {
  const results = [
    {
      type: 'article',
      id: '1',
      title: 'Bot Info',
      input_message_content: {
        message_text: '🤖 This is a Vercel-hosted Telegram Bot!\n\nPowered by serverless functions.'
      },
      description: 'Get information about this bot'
    }
  ];
  
  bot.answerInlineQuery(query.id, results);
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set webhook on first run
  if (process.env.VERCEL_URL && !process.env.WEBHOOK_SET) {
    await setWebhook();
    process.env.WEBHOOK_SET = 'true';
  }

  if (req.method === 'POST') {
    try {
      const update = req.body;
      await bot.processUpdate(update);
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error processing update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(200).json({ 
      message: 'Telegram Bot is running!',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
};
