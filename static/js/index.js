var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
var devices
var activeIndex;
var iosRear = false;
var url = 'https://ss2019-hq.herokuapp.com';

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
    // timer_id = setInterval('decode()', 500);
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
    alert("hoge");
    reflesh_wishlist();
    // QRコードの読み取りを開始
    startReadQR();


}

function search_product(product_id){
    var path = '/api/products/';
    var modal_image = document.getElementById('modal-item-image');
    var modal_name = document.getElementById('modal-item-name');
    var modal_price = document.getElementById('modal-item-price');
    var modal_id = document.getElementById('modal-item-id');


    fetch(url + path + product_id + '/', {method: 'GET',mode: 'cors'})
      .then(response => {
        return response.json();
      }).then(function(json) {
        modal_image.src = json.img_url;
        modal_name.innerHTML = json.name;
        modal_price.innerHTML = json.price;
        modal_id.value = json.p_id;
        $('#exampleModalCenter').modal('show');
        return "flag"
      });
}

function add_wishlist() {
  var path = '/api/wishlist/';
  var modal_id = document.getElementById('modal-item-id');
  var user_id = document.getElementById('modal-user-id');
  var p_id = document.getElementById('modal-item-id');


  fetch(url + path + "?userid=" + user_id.value + "&pid=" + p_id.value, {
    method: 'POST',
    mode: 'cors'
  }).then(response => {
      return response.json();
    }).then(function(json) {
      console.log("added");
      $('#exampleModalCenter').modal('hide');
      reflesh_wishlist();
      startReadQR();
      return "flag"
    });
}

function reflesh_wishlist() {
  var path = '/api/wishlist/';
  var user_id = document.getElementById('modal-user-id').value;

  fetch(url + path + "?userid=" + user_id, {method: 'GET',mode: 'cors'})
  .then(response => {
      return response.json();
    }).then(function(json) {
      document.getElementById('food_list').textContent = null;
      for (var i=0; i<Object.keys(json).length; i++) {
        document.getElementById('food_list').insertAdjacentHTML('beforeend', '<div class="card"><img src="' + json[i].img_url + '"><div class="contents"><h2>' + json[i].name + '</h2><div>' + json[i].price + '</div></div></div></div>');
      }

      return "flag"
    });
}
