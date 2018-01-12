var buf = {};
buf['Chart'] = [[], [], [], [], [], []];

// coincheck
var ws = new WebSocket('wss://ws-api.coincheck.com/');
ws.onopen = function() {
    ws.send(JSON.stringify({        // 購読リクエストを送信
        "type": "subscribe",
        "channel": "btc_jpy-trades"
    }));
};
ws.onmessage = function(msg) { // メッセージ更新時のコールバック
    var response = JSON.parse(msg.data);
    buf['Chart'][response[4] === 'buy' ? 0 : 1].push({
        x: Date.now(), // タイムスタンプ_（ミリ秒）
        y: response[2] // 価格（日本円）
    });
}

// bitflyer
var pubnub = new PubNub({
    subscribeKey: 'sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f'
});
pubnub.addListener({
    message: function (message) {
    buf['Chart'][2].push({
        x: Date.now(), // タイムスタンプ（ミリ秒）
        y: message.message.best_ask // 価格（日本円）
    });
    buf['Chart'][3].push({
        x: Date.now(), // タイムスタンプ（ミリ秒）
        y: message.message.best_bid // 価格（日本円）
    });
    }
});
pubnub.subscribe({
    channels: ['lightning_ticker_BTC_JPY']
});



// zaif
var ws_zaif = new WebSocket('wss://ws.zaif.jp:8888/stream?currency_pair=btc_jpy');
ws_zaif.onmessage = function(msg) { // メッセージ更新時のコールバック
    var response = JSON.parse(msg.data);
    var data = response['last_price'];
    buf['Chart'][data['action'] === 'ask' ? 4 : 5].push({
        x: Date.now(), // タイムスタンプ（ミリ秒）
        y: data['price'] // 価格（日本円）
    });
}

// Quoine
/*
var Timer = function() {
	//fetch('http://bit:check@27.133.132.138:8051/getData.php?type=quoine_chart',{
	//fetch('http://bit:check@27.133.132.138:8051/getData.php?type=quoine_chart',{
	fetch('/getData.php?type=quoine_chart',{
	})
	.then((res) => {
		return res.json();
	}).then((json) => {
	Math.floor(json.market_bid)
    buf['Chart'][6].push({
        x: Date.now(), // タイムスタンプ（ミリ秒）
        y: json.market_ask // 価格（日本円）
    });
    buf['Chart'][7].push({
        x: Date.now(), // タイムスタンプ（ミリ秒）
        y: json.market_bid // 価格（日本円）
    });
	}).catch((ex) => {
//    console.log('failed:', ex);
	})
};
var timerID = setInterval(Timer, 5000);
*/

var id = 'Chart';
var ctx = document.getElementById(id).getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
	// coincheck
            data: [],
            label: 'coincheck-Ask',                     // 買い取引データ
            borderColor: 'rgb(54, 162, 235, 10)', // 線の色
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }, {
            data: [],
            label: 'coincheck-Bid',                    // 売り取引データ
            borderColor: 'rgb(255, 99, 132)', // 線の色
            backgroundColor: 'rgba(255, 99, 132, 0.5)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }, {
	// bitflyer
            data: [],
            label: 'bitflyer-Ask',                     // 買い取引データ
            borderColor: 'rgb(54, 162, 235, 10)', // 線の色
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // 塗りの色
//            pointBorderColor: 'rgba(0, 128, 0, 1)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            pointStyle: 'star',                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }, {
            data: [],
            label: 'bitflyer-Bid',                    // 売り取引データ
            borderColor: 'rgb(255, 99, 132)', // 線の色
            backgroundColor: 'rgba(255, 99, 132, 0.5)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }, {
	// Zaif
            data: [],
            label: 'zaif-Ask',                    // 売り取引データ
            borderColor: 'rgb(54, 162, 235, 10)', // 線の色
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }, {
            data: [],
            label: 'zaif-Bid',                    // 売り取引データ
            borderColor: 'rgb(255, 99, 132)', // 線の色
            backgroundColor: 'rgba(255, 99, 132, 0.5)', // 塗りの色
            borderWidth: 5,                      // 塗りつぶさない
            fill: false,                      // 塗りつぶさない
            lineTension: 0                    // 直線
        }]
    },
    options: {
        title: {
            text: 'Price Chart', // チャートタイトル
            display: true
        },
        scales: {
            xAxes: [{
                type: 'realtime' // X軸に沿ってスクロール
            }]
        },
        plugins: {
            streaming: {
                duration: 60000, // 60000ミリ秒（1分）のデータを表示
                refresh: 2000, // 2000ミリ秒（1秒）毎のデータ更新
                onRefresh: function(chart) { // データ更新用コールバック
                    Array.prototype.push.apply(
                        chart.data.datasets[0].data, buf[id][0]
                    );            // 買い取引データをチャートに追加
                    Array.prototype.push.apply(
                        chart.data.datasets[1].data, buf[id][1]
                    );            // 売り取引データをチャートに追加
                    Array.prototype.push.apply(
                        chart.data.datasets[2].data, buf[id][2]
                    );            // 売り取引データをチャートに追加
                    Array.prototype.push.apply(
                        chart.data.datasets[3].data, buf[id][3]
                    );            // 売り取引データをチャートに追加
                    Array.prototype.push.apply(
                        chart.data.datasets[4].data, buf[id][4]
                    );            // 買い取引データをチャートに追加
                    Array.prototype.push.apply(
                        chart.data.datasets[5].data, buf[id][5]
                    );            // 売り取引データをチャートに追加
                    buf[id] = [[], [], [], [], [], []]; // バッファをクリア
                }
            }
        }
    }
});

