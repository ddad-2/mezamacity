const http = require('http');

/**
 * OpenWeatherMap APIから大阪の天気情報を取得します。
 * @param {string} api OpenWeatherMapのAPIキー
 * @returns {Promise<object>} 天気データオブジェクトを解決するPromise、またはエラーを拒否するPromise
 */
function clweather(api) {
  return new Promise((resolve, reject) => { // Promiseを返すように変更
    const LAT = 34.6937;   // 大阪の緯度
    const LON = 135.5023;  // 大阪の経度
    const reqUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${api}&units=metric&lang=ja`;

    http.get(reqUrl, (res) => {
      let body = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          // console.log(json); // app.js側で処理するため、ここでは直接ログ出力しない
          resolve(json); // 成功した場合、Promiseを解決してデータを返す
        } catch (e) {
          console.error('JSONの解析に失敗しました:', e.message);
          reject(new Error(`JSON解析エラー: ${e.message}`)); // エラーの場合、Promiseを拒否
        }
      });
    }).on('error', (e) => {
      console.error('通信エラー:', e.message);
      reject(new Error(`通信エラー: ${e.message}`)); // エラーの場合、Promiseを拒否
    });
  });
}

module.exports = {
  clweather
};