const { TranslateClient, ListLanguagesCommand, TranslateTextCommand } = require("@aws-sdk/client-translate")

const LANG_LIST = [
  'ar', 'az', 'de', 'en', 'es', 'fa', 'fr',
  'it',
  'jp',
  'ko',  // Korean
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'tr',
  'zh',
  'id', // Indonesian
  'he', // Hebrew
  'ms', // Mala
]

exports.translateText = (text, sourceLang, targetLang) => {
  return new Promise((resolve, reject) => {
    const client = new TranslateClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      region: process.env.AWS_REGION,
    })

    const command = new TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: text,
      Settings: {
        Brevity: 'ON',
        Formality: 'INFORMAL',
        Profanity: 'MASK'
      }
    })

    client.send(command)
      .then(resolve)
      .catch(reject)
  })
}
