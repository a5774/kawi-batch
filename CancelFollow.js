const https = require('https')
const fs = require('fs')
let readline = require('readline')
const cancel = 'https://www.kuaishou.com/graphql'
const follows = 'https://www.kuaishou.com/graphql'
const profile = require('./user/18270324314/config.json')
function dly(time) {
    return new Promise(res => {
        setTimeout(() => {
            res(null)
        }, time);
    })
}

let user_id = '577632373'
let ks_st = 'ChZrdWFpc2hvdS53ZWIuY3AuYXBpLnN0EqABoGWox5qTsRQOtRoD64Rp_8OdbWQ1VY95A7fpxflbVVr7vtSokw2XQ2YaL67g_OzvFy0ptuKRyOv1lDB2J90kSg8nyVllC7I2egP-zRqzgZHsUSewlFUDr2suq2nTOmIQXfdPJTgUn19jjAk6cjJAlIJPNCrB1BCp4KRCnWvEQWHpWz76moPb1hPcKwWrEQxDTX2AeGlx0kSY39ij_Au-oxoSbKr85gMQZaXHkGEEWYIryxaxIiCIL7x5Lwy7k_j7JiJ_t38KBYU93O3JOAQRvIY5wsNNOygFMAE'
let ks_ph = '36183b637ffd1215c09efa2c2645864de3bb'
let did = 'web_21c4329a8b24d9fb19c92f9947985ae2'
let kt_ctx = '1|MS43NjQ1ODM2OTgyODY2OTgyLjMzNjg1MTI3LjE2Njk5NDg3MzY0MzkuMjg3Ng==|MS43NjQ1ODM2OTgyODY2OTgyLjEyMjY5MjQ3LjE2Njk5NDg3MzY0MzkuMjg3Nw==|0|graphql-server|webservice|false|NA'
let ks_ser_st = 'ChZrdWFpc2hvdS5zZXJ2ZXIud2ViLnN0EqABsWFmgUMUfKtkChT90-8nlGHEX5-XRSXzP4x2NJeyU24wt-AXIG-u6yATx333ekwyw7UOBKwEiN15umpDu0eNYW9LdFeDTP7KtzFNQZS2YVnDKgV7ptppNEZIzm5t3E6xtz0AFiTlbpVAni8hwUbdiMaqsIdg_Ka9lgma13yiESKxZ62xdeg2MEeBUX5oR6PQjgS0EjrUyJckK40H0ja9-hoScSev-lUTUQRM3QfVIiGGGpa1IiBJ8oceUbcEKsczGwK57FjDR7zXn4YDJuzU4dwqvo-i8CgFMAE'
let ks_ser_ph = '69e00ceb45b604450e5a35e6d6b76dfa6de3'
let cookie = [
    'soft_did=1619580708547',
    `userId=${user_id}`,
    `kuaishou.web.cp.api_st=${ks_st}`,
    `kuaishou.web.cp.api_ph=${ks_ph}`,
    `kpf=PC_WEB`,
    `kpn=KUAISHOU_VISION`,
    `clientid=3`,
    `did=${did}`,
    `ktrace-context=${kt_ctx}`,
    `kuaishou.server.web_st=${ks_ser_st}`,
    `kuaishou.server.web_ph=${ks_ser_ph}`
]
async function getFollowList() {
    let idx = 0
    let len = 1
    while (len) {
        let payload = {
            operationName: 'visionProfileUserList',
            query: 'query visionProfileUserList($pcursor: String, $ftype: Int) {\n  visionProfileUserList(pcursor: $pcursor, ftype: $ftype) {\n    result\n    fols {\n      user_name\n      headurl\n      user_text\n      isFollowing\n      user_id\n      __typename\n    }\n    hostName\n    pcursor\n    __typename\n  }\n}\n',
            variables: {
                ftype: 1,
                pcursor: `${idx}`
            }
        }
        let req = https.request(follows, {
            method: 'POST',
            headers: {
                'HOST': 'www.kuaishou.com',
                'Origin': 'https://www.kuaishou.com',
                'Content-Type': 'application/json;charset=UTF-8',
                'Referer': 'https://www.kuaishou.com/profile/3xykbfj9ergptjg',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        })
        req.setHeader('Cookie', cookie)
        req.flushHeaders()
        req.write(JSON.stringify(payload))
        req.end()
        req.addListener('response', resp => {
            resp.addListener('readable', () => {
                let _fragment = JSON.parse(resp.read())['data']['visionProfileUserList']['fols']
                len = _fragment.length
                Array.prototype.forEach.call(_fragment || [], (item) => {
                    fs.writeFileSync('./list', `${JSON.stringify(item)}\n`, { flag: 'a+' })
                })
                idx += 30
            })
        })
        await dly(1000)
    }
    return null
}

async function cancelFollow() {

    // await getFollowList()

    let rl = readline.createInterface({
        input: fs.createReadStream('./list'),
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        await dly(200)
        let payload = {
            operationName:'visionFollow',
            query:'mutation visionFollow($touid: String, $ftype: Int, $followSource: Int, $expTag: String) {\n  visionFollow(touid: $touid, ftype: $ftype, followSource: $followSource, expTag: $expTag) {\n    result\n    followStatus\n    hostName\n    error_msg\n    __typename\n  }\n}\n',
            variables:{
                followSource: 1 ,
                ftype: 2 ,
                touid: `${JSON.parse(line)['user_id']}`
            }

        }
        let req = https.request(cancel, {
            method: 'POST',
            headers: {
                'HOST': 'www.kuaishou.com',
                'Origin': 'https://www.kuaishou.com',
                'Content-Type': 'application/json;charset=UTF-8',
                'Referer': 'https://www.kuaishou.com/profile/3xykbfj9ergptjg',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        })
        req.setHeader('Cookie', cookie)
        req.flushHeaders()
        req.write(JSON.stringify(payload))
        req.end()
        req.addListener('response', resp => {
            resp.setEncoding('utf-8')
            console.log(`${JSON.parse(line)['user_name']}:Cancel Follow`);
        })
    }
}
getFollowList()

// cancelFollow()




