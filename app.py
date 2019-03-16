import json
import requests
import jwt
from flask import Flask, request
from flask import render_template, redirect, session

app = Flask(__name__)
app.config["SECRET_KEY"] = "sample1216"

LINE_CHANNEL_ID = "1555715817"
LINE_CHANNEL_SECRET = "eed09fb8e31fd4e41005f0400e3873c7"
REDIRECT_URL = "https://76f5777c.ngrok.io/line/login"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html",
                           random_state="line1216",
                           channel_id=LINE_CHANNEL_ID,
                           redirect_url=REDIRECT_URL)

@app.route("/line/login", methods=["GET"])
def line_login():
    print("line_id_token")
    try:
        # セッション取得
        user_name = session['name']
        user_picture = session['picture']
        line_access_token = session['access_token']
    except:
        # 認可コードを取得する
        request_code = request.args["code"]
        uri_access_token = "https://api.line.me/oauth2/v2.1/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data_params = {
            "grant_type": "authorization_code",
            "code": request_code,
            "redirect_uri": REDIRECT_URL,
            "client_id": LINE_CHANNEL_ID,
            "client_secret": LINE_CHANNEL_SECRET
        }

        # トークンを取得するためにリクエストを送る
        response_post = requests.post(uri_access_token, headers=headers, data=data_params)

        # 今回は"id_token"のみを使用する
        line_id_token = json.loads(response_post.text)["id_token"]

        line_access_token = json.loads(response_post.text)["access_token"]

        # ペイロード部分をデコードすることで、ユーザ情報を取得する
        decoded_id_token = jwt.decode(line_id_token,
                                      LINE_CHANNEL_SECRET,
                                      audience=LINE_CHANNEL_ID,
                                      issuer='https://access.line.me',
                                      algorithms=['HS256'])

        print("line_id_token")

        user_name = decoded_id_token["name"]
        user_picture = decoded_id_token["picture"]

        # セッション情報を書き込み
        session["name"] = user_name
        session["picture"] = user_picture
        session["access_token"] = line_access_token

    return render_template("login_success.html", name=user_name, picture=user_picture, access_token=line_access_token)

@app.route("/logout", methods=["GET"])
def logout():
    uri_access_token = "https://api.line.me/oauth2/v2.1/revoke"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    line_id_token = request.args.get('access_token')
    data_params = {
        "access_token": line_id_token,
        "client_id": LINE_CHANNEL_ID,
        "client_secret": LINE_CHANNEL_SECRET
    }

    # ログアウト
    requests.post(uri_access_token, headers=headers, data=data_params)

    # セッション削除
    session.pop('name', None)
    session.pop('id', None)
    session.pop('picture', None)
    session.pop('access_token', None)

    # リダイレクト
    return redirect("/")

if __name__ == '__main__':
    app.run(debug=True)
