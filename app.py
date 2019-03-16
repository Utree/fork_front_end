from flask import Flask, request, abort

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)

app = Flask(__name__)

line_bot_api = LineBotApi('Oa9fpS5EhafbmWtPXNniup8xY33Z8pjWGmi7jxaIGvAwKprkbB8CPy8gCFmoj2Q2ASv1jFMI+S5aRbwOgqtx9szOh5KdXTOC3hgLHed84irrvoLbkwLYTwlOU4z4QF7ovnakxutg28HT2d+x2LpGyAdB04t89/1O/w1cDnyilFU=')
handler = WebhookHandler('206c0b1959a390333e254aafdff39d53')


@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']

    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # メッセージ内容で返信を振り分け
    

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)

    return 'OK'


@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    try:
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=event.message.text))
    except:
        app.logger.error('返信に失敗しました')

if __name__ == "__main__":
    app.run()
