const { createHash } = require('crypto')
async function TranferText(src) {
    let api = 'http://api.fanyi.baidu.com/api/trans/vip/translate'
    let salt = `${Date.now()}`
    let to = 'zh'
    let from = 'auto'
    let appID = '20220408001164129'
    let key = 'BOxJokpEobD96uFcJts_'
    let str = `${appID}${src}${salt}${key}`
    let hex_str = createHash('md5').update(str).digest('hex')
    let encode = `q=${src}&from=${from}&to=${to}&appid=${appID}&salt=${salt}&sign=${hex_str}`
    return new Promise(resolve => {
        let req = require('http').request(api, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        req.write(encode)
        req.end()
        req.addListener('response', resp => {
            resp.addListener('data', data => {
                resp.setEncoding('utf-8')
                // console.log(data.toString());
                resolve(JSON.parse(data.toString()).trans_result?.[0]?.dst)
            })
        })
    })
}

TranferText('yes')
module.exports = {
    TranferText,
    createHash
}
