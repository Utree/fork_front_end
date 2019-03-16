var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
var devices
var activeIndex;
var iosRear = false;

// カメラ情報取得
Instascan.Camera.getCameras()
    .then(function (cameras) {
        var list = document.getElementById('cameras');
        devices = cameras;
        changeCamera(devices.length - 1);
    })
    .catch(function (err) {
        alert('カメラが見つかりません');
    });

var video = document.getElementById('video');
var img = document.getElementById('img');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var localStream = null;
var timer_id = null;

// スナップショットを取得
function snapshot() {
  img.src = canvas.toDataURL('image/png')
}

// 画像をデコード
function decodeImageFromBase64(data, callback) {
    qrcode.callback = callback;
    qrcode.decode(data);
}
function decode() {
    if (localStream) {
        var h;
        var w;

        if (window.innerHeight > window.innerWidth) {
            w = video.offsetHeight;
            h = video.offsetWidth;
        } else {
            w = video.offsetWidth;
            h = video.offsetHeight;
        }

        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);
        ctx.drawImage(video, 0, 0, w, h);

        decodeImageFromBase64(canvas.toDataURL('image/png'), function (decodeInformation) {
            var input = document.getElementById('qr');
            if (!(decodeInformation instanceof Error)) {
                input.value = decodeInformation;
                // 読み取り後
                search_product(decodeInformation);
                clearInterval(timer_id);
            }
        });
    }
}
// QRコードの読み取りを開始
function startReadQR() {
    timer_id = setInterval('decode()', 500);
}
// カメラを切り替え
function changeCamera(index) {
    if (localStream) {
        localStream.getVideoTracks()[0].stop();
    }
    activeIndex = index;
    iosRear = !iosRear;
    setCamera();
}

// 初期設定
function setCamera() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || windiow.navigator.mozGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    var videoOptions;
    if (ios) {
        videoOptions = {
            facingMode: {
                exact: (iosRear) ? 'environment' : 'user'
            }
        };
    } else {
        videoOptions = {
            mandatory: {
                sourceId: devices[activeIndex].id,
                minWidth: 600,
                maxWidth: 800,
                minAspectRatio: 1.6
            },
            optional: []
        };
    }

    navigator.getUserMedia(
        {
            audio: false,
            video: videoOptions
        },
        function (stream) { // カメラからvideoタグにストリーム
            video.srcObject = stream;
            localStream = stream;
        },
        function (err) { //エラー処理
          alert(err);
        }
    );

    // QRコードの読み取りを開始
    startReadQR();
}

function search_product(product_id){
    var url = 'https://ss2019-hq.herokuapp.com';
    var path = '/api/products/';
    var headerParams = 'Content-Type: application/json';
    var result = $.ajax({
      url: url + path + product_id + '/',
      type: 'GET',
      dataType: 'json',
      headers: headerParams,
      async: false
    }).responseText;

    console.log(result);

    return result;
}
