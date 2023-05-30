/* const { URL } = require("url");

let t = [
    'did=web_06fb97ed6625d3ee30e26426099958bbefcf; Path=/; Domain=kuaishou.com; Max-Age=2147483647; Expires=Mon, 27 Nov 2090 10:37:25 GMT; Secure; SameSite=None',
    'userId=110986478; Path=/; Domain=kuaishou.com; Max-Age=1814400; Expires=Wed, 30 Nov 2022 07:23:18 GMT; Secure; SameSite=None',
    'userId=110986478; Path=/; Max-Age=1814400; Expires=Wed, 30 Nov 2022 07:23:18 GMT; Secure; SameSite=None',
    'passToken=ChNwYXNzcG9ydC5wYXNzLXRva2VuEsABawkAk7V7YWjrXxcJTQHCtu8hTKS95llw0GWGl_Y8zDEBZYNcuylVbRkCIMuFVtLxa_ylzFdZi1mIa5lua4eSfaKwnrr6KACxD9Cd1zkANot8v5RNYtTapT-eq4AwxgpKcH02W9wWuS5RbU0snR-7EB9mOmjszeT8QXSip68VSKtim0kQRH5OsO2BeCAK8eHD5EdOgtMmcdoCJ4ANsSHSjBeGM8OXmhl52Rift0Pk4tzDvP6g2uW-Ht35XipXTC0BGhLciG6Gyc9HkZ9gfUBBWjyoFgciINKa0zsyuics2H997-a6PxrBK4gVUo2omzUYm89KNJFyKAUwAQ; Path=/; Max-Age=1814400; Expires=Wed, 30 Nov 2022 07:23:18 GMT; Secure; HttpOnly; SameSite=None'
]
// console.log(Object.fromEntries());
console.log(
    Object.fromEntries(new Map(t.map(it => it.split(";")[0]).map(it => it.split("="))))
);
let keys = {
    did:454545,
    userId:787878
}
console.log(['soft_did=1619580708547',`did=${keys.did}`,`userId=${keys.userId}`]);
let rl = "https://cp.kuaishou.com/rest/infra/sts?followUrl=https%3A%2F%2Fcp.kuaishou.com%2Farticle%2Fpublish%2Fvideo%3Forigin%3Dwww.kuaishou.com&setRootDomain=true&sid=kuaishou.web.cp.api&authToken=ChZrdWFpc2hvdS53ZWIuY3AuYXBpLmF0EsABRsUmQF8V6prrBRkn24H7PPmwxvMazqAEtljCYZcrpullc0xLbn4aQxGcTzLdyP_6dcAx7C5S10LxE0RLoR642Y5LldgMyEJFCbZj_FAC2AQCSfgoiHyMp6-QVxaYlILqK3lHNFOd-asNK6WfXuvZkq4YkWMLdDz0rmG8dOpHkvk1-5RosKwyepyBywDacqfWmo_RfwA_y3l8juW1dH6tOjcKWXnA9NhdlVnlmsPR9U435u8NS-e9JC04-HmCRL8wGhJmnvTI_C9Op9J1-XMePSWTrSkiIJZyzMp6STCZGL9ypDMqFq_vvoa-PcIbVZurSAQ6N3aYKAUwAQ"
let us = new URLSearchParams()
us.set('followUrl','https://cp.kuaishou.com/article/publish/video?origin=www.kuaishou.com')
us.set('setRootDomain','true')
us.set('sid','kuaishou.web.cp.api')
us.set('authToken','ChZrdWFpc2hvdS53ZWIuY3AuYXBpLmF0EsABRsUmQF8V6prrBRkn24H7PPmwxvMazqAEtljCYZcrpullc0xLbn4aQxGcTzLdyP_6dcAx7C5S10LxE0RLoR642Y5LldgMyEJFCbZj_FAC2AQCSfgoiHyMp6-QVxaYlILqK3lHNFOd-asNK6WfXuvZkq4YkWMLdDz0rmG8dOpHkvk1-5RosKwyepyBywDacqfWmo_RfwA_y3l8juW1dH6tOjcKWXnA9NhdlVnlmsPR9U435u8NS-e9JC04-HmCRL8wGhJmnvTI_C9Op9J1-XMePSWTrSkiIJZyzMp6STCZGL9ypDMqFq_vvoa-PcIbVZurSAQ6N3aYKAUwAQ')
// console.log(us);
let ul = new URL("https://cp.kuaishou.com/rest/infra/sts")
ul.search = us
console.log(ul.toString()); */

/* 


let submit_pre_deatil = {
     'fileLength': fi['fileLength'],
    'fileName': fi['fileName'],
    'fileType': fi['fileType'],
    'kuaishou.web.cp.api_ph': cfg['kuaishou.web.cp.api_ph'],
    'fileToken': cfg['data']['token'],
    'coverMediaId': cfg_fe['data']['coverMediaId'],
    'coverKey': cfg_fe['data']['coverKey'],
    'duration': cfg_fe['data']['videoDuration'] / 1000,
    'fileId': cfg_fe['data']['fileId'],
    'fileSize': fi['fileSize'],
    'height': cfg_fe['data']['height'],
    'mediaId': cfg_fe['data']['mediaId'],
    'photoIdStr': cfg_fe['data']['photoIdStr'],
    'videoDuration': cfg_fe['data']['videoDuration'],
    'videoSizeHeight': cfg_fe['data']['height'],
    'videoSizeWidth': cfg_fe['data']['width'],
    'width': cfg_fe['data']['width'], 
    allowSameFrame: true,
    caption: '',
    collectionId: '',
    coverCropped: false,
    coverTimeStamp: '-1',
    coverTitle: '',
    coverType: 1,
    disableNearbyShow: false,
    domain: '',
    downloadType: 1,
    // innerChannel
    latitude: null,
    longitude: null,
    movieId: '',
    needDeleteKey: [],
    notifyResult: 0,
    // onvideoDuration
    openPrePreview: false,
    photoStatus: 1,
    photoType: 0,
    pkCoverKey: '',
    previewUrlErrorMessage: '',
    projectId: '',
    publishTime: 0,
    // recTagIdList
    secondDomain: '',
    triggerH265: false,
    videoFirstFrameURL: {},
    videoInfoMeta: '',
}
function mod_spd_pre(key,value){
    return Reflect.set(submit_pre_deatil,key,value)
} */
const http = require('http')

const fs = require('fs')
/* 
let f = fs.createReadStream('./video/2022-09-17_15-22-59.mp4', {
    highWaterMark:4194304 ,
    encoding: 'binary',
    autoClose:false,
})
f.addListener('data', async (data) => {

    new Promise(res => {
        let w = http.request('http://127.0.0.1:8888', {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
            }
        }).addListener('response', resp => {
            resp.addListener('data', d => {
                console.log(d.toString());
                f.resume()
                res(d)
            })
        })
        // fs.createReadStream('./video/wx.jpg',{encoding:'binary'}).pipe(w)
        // let by = fs.readFileSync('./video/2022-11-11_00-40-07.mp4', { encoding: 'binary' })
        console.log(data.length);
        w.write(data, 'binary')
        w.end(()=>{
            f.pause()

        })
        // f.pause()
    })
})
 */


// f.addListener('')
/* console.log((35215640 / 4194304).toFixed(0));
let a = 4194304 * 8
console.log(a );
let b = 4194304
let c = []
let x = 0 
let y = 0 
while(a>=b){
    a = a - b;
    [x,y] = [y ,y + b ]
    c.push({x,y:y - 1})
}
// console.log(35215640 - );
// let [ n,m ] = [m, n]
c.push({x:(c[c.length -1 ].y +1),y:(35215640 - 1) })
console.log(c);

console.log(Math.ceil(0.1)); */
// let j = {
//     a:2
// }
// fs.writeFileSync('./Domain.json',JSON.stringify(j))
// // require
// console.log(require('./Domain.json'));
// fs.writeFileSync('./Domain.json',JSON.stringify({b:12}),{flag:'a+'})
// console.log(require('./Domain.json'));

/* let da = [
    {suffix: "mp4", mime: "video/mp4"},
    
    {suffix: "mov", mime: "video/quicktime"},
    
    {suffix: "flv", mime: "video/x-flv"},
    
    {suffix: "f4v", mime: "video/x-f4v"},
     
    {suffix: "webm", mime: "video/webm"},
    
    {suffix: "mkv", mime: "video/x-matroska"},
    
    {suffix: "rm", mime: "application/vnd.rn-realmedia"},
    
    {suffix: "rmvb", mime: "application/vnd.rn-realmedia-vbr"},
    
    {suffix: "m4v", mime: "video/x-m4v"},
    
    {suffix: "3gp", mime: "video/3gpp"},
    
    {suffix: "3g2", mime: "video/3gpp2"},
    
    {suffix: "wmv", mime: "video/x-ms-wmv"},
    
    {suffix: "avi", mime: "video/x-msvideo"},
    
    {suffix: "asf", mime: "video/x-ms-asf"},
     
    {suffix: "mpg", mime: "video/mpg"},
    
    {suffix: "mpeg", mime: "video/mpg"},
    
    {suffix: "ts", mime: "video/mp2t"}
]
let o = {

}
da.forEach(i=>{
    
    Reflect.set(o,i.suffix,i.mime)

})
fs.writeFileSync('./MineType.json',JSON.stringify(o),{flag:'a'}) */
// const fs = require('fs')
let data = 'iVBORw0KGgoAAAANSUhEUgAAAH0AAAB9AQAAAACn+1GIAAABz0lEQVR4Xr2VPY7sIBCE2yIg81wAiWt0xpXsC/jnAuZKzrgGEhfwZgSIfg0zq9VGzUvWGmk0X8AUVdVtoN9Phr8BFeCVrb8LaDpADQFHl7YV6UDrKQ0BVBfY86aq6YJhgGVxZaf0H8CZ9S7r/XOGAFgpxhfRGX6kCwBgxnT1z7dBAuhWl4kvh7a7PgAy+x0XiBvCAnYEVLCPUwfG2cVFdx0SILKXhjXTme2BXYcE2I8H4xrSpc30MUgCyN+ckjrJHu8YJECBbTB7SGdOjxsCFZLPin/xGWfo1ZZB2RxMt32w4RFAoUw8DbksGjZsFoqgOrNndTi2sOz9b2UAdOj0le1JcQpdhwQoE4tdXHyFj1IRVBcnspTNrNXjWoNEQHeizGPHJTJTGALVlVknatmS79JFQHfcNI9BBORhbZ7KIHBPzQZcUna9ByWCuyxgZrR8y5X6oRKobUUlT6o6LtEQoMwDatZQAGF6xyCBqnnTKN6g/gZoSmXAVlQNPEA+p6qHQNtSmuPl7c4ndeki4F0I9qvVIdV3tUWAygf2j3sH8FnBA6DtQPMi++jWoBFw6RbRwe3uMcjAke/V3gNsn8tJoL0J6YH2Gnx6DCKg388fgX+hDLcuBKqSmQAAAABJRU5ErkJggg=='
let dataBuffer =  Buffer.from(data,'base64')
fs.writeFileSync('./qrcode.png',dataBuffer,{encoding:'binary'})