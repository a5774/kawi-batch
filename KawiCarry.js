const https = require('https')
const process = require('process')
const { URL, URLSearchParams } = require('url')
const fs = require('fs')
const path = require('path')
const schedule = require('node-schedule')
const Domain = require('./resource/Domain.json')
const MineType = require('./resource/MineType.json')
const FormData = require('form-data')
const cp = require('child_process')
const { TranferText, createHash } = require('./Tranfer')
const fragment_step_size = 4194304
let u1 = 18270324314
let u2 = 15374247732
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// https://upload.kuaishouzt.com
let api = {
    '0x000001': "https://id.kuaishou.com/pass/kuaishou/sms/requestMobileCode",
    '0x000002': "https://id.kuaishou.com/pass/kuaishou/login/mobileCode",
    '0x000003': "https://cp.kuaishou.com/rest/infra/sts",
    '0x000004': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/upload/pre",
    '0x000005': "https://upload.kuaishouzt.com/api/upload/resume",
    '0x000006': "https://upload.kuaishouzt.com/api/upload/fragment",
    '0x000007': "https://upload.kuaishouzt.com/api/upload/complete",
    '0x000008': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/upload/finish",
    '0x000009': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/publishInfo/snapshot/save",
    '0x000010': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/snapshot/delete",
    '0x000011': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/submit",
    '0x000012': 'https://id.kuaishou.com/pass/kuaishou/login/multiUserToken',
    '0x000013': "https://cp.kuaishou.com/rest/cp/works/v2/video/pc/upload/cover/upload",
    '0x000014': "https://id.kuaishou.com/rest/c/infra/ks/qr/start",
    '0x000015': "https://id.kuaishou.com/rest/c/infra/ks/qr/scanResult",
    '0x000016': "https://id.kuaishou.com/rest/c/infra/ks/qr/acceptResult",
    '0x000017': "https://id.kuaishou.com/pass/kuaishou/login/qr/callback",
}

class Kwai {
    constructor(phone, flag) {
        this.QR = {}
        this.phone = phone
        this.flag = flag ?? 0
        this.user_config = `./user/${this.phone}/config`
    }
    async req_kwai_sms_code() {
        console.log("stage: REQUSET_SMSCODE");
        let pre_ct = `sid=kuaishou.web.cp.api&type=53&countryCode=%2B86&phone=${this.phone}&account=&ztIdentityVerificationType=&ztIdentityVerificationCheckToken=&channelType=PC_PAGE&encryptHeaders=`
        let pre = https.request(api['0x000001'], {
            method: "POST",
            headers: {
                "Host": "id.kuaishou.com",
                "Origin": "https://passport.kuaishou.com",
                "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Farticle%252Fpublish%252Fvideo%253Forigin%253Dwww.kuaishou.com%26setRootDomain%3Dtrue",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        pre.write(pre_ct)
        pre.end()
        pre.addListener('response', resp => {
            resp.addListener('data', dt => {
                console.log(dt.toString());
            })
        })
    }

    async get_kwai_ph_at(sms_code) {
        console.log("stage: SMS_PH_AT_ST");
        return new Promise(resolve => {
            let next_ct = `countryCode=%2B86&phone=${this.phone}&sid=kuaishou.web.cp.api&createId=true&smsCode=${sms_code}&setCookie=true&channelType=PC_PAGE&encryptHeaders=`.replace(/\r\n/g, '')
            let next = https.request(api['0x000002'], {
                method: "POST",
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Farticle%252Fpublish%252Fvideo%253Forigin%253Dwww.kuaishou.com%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            next.write(next_ct)
            next.end()
            next.addListener('response', resp => {
                let Cookie = Object.fromEntries(
                    new Map(
                        resp.headers['set-cookie']
                            .map(it => it.split(";")[0])
                            .map(it => it.split("="))
                    )
                )
                resp.addListener('readable', () => {
                    let keys = { ...JSON.parse(resp.read()), ...Cookie }
                    fs.mkdirSync(path.resolve(__dirname, `./user/${this.phone}/videoLog/`), { recursive: true })
                    w_cfg_json(keys, this.user_config)
                    resolve(keys)
                })
            })
        })
    }



    // multi
    async cho_kwai_mt_us(keys) {
        console.log('stage: MULTI_SELECT');
        return new Promise(resolve => {
            let us_mt_ct = `countryCode=%2B86&phone=${this.phone}&sid=kuaishou.web.cp.api&account=&targetUserId=${keys?.userId ?? keys['userInfos'][this.flag]['userId']}&multiUserToken=${keys['multiUserToken']}&setCookie=true&channelType=PC_PAGE&encryptHeaders=`.replace(/\r\n/g, '')
            // let us_mt_ct = `countryCode=%2B86&phone=${this.phone}&sid=kuaishou.web.cp.api&account=&targetUserId=${keys['userInfos'][]}&multiUserToken=${keys['multiUserToken']}&setCookie=true&channelType=PC_PAGE&encryptHeaders=`.replace(/\r\n/g, '')
            let Cookie = [
                'soft_did=1619580708547',
                `did=${keys['did']}`,
                'clientid=3',
                'language=zh-CN',
            ]
            let mt_us = https.request(api['0x000012'], {
                method: 'POST',
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Farticle%252Fpublish%252Fvideo%253Forigin%253Dwww.kuaishou.com%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            })
            mt_us.setHeader('Cookie', Cookie)
            mt_us.flushHeaders()
            mt_us.write(us_mt_ct)
            mt_us.end()
            mt_us.addListener('response', resp => {
                resp.addListener('readable', () => {
                    let keys_ = { ...JSON.parse(resp.read()) }
                    fs.mkdirSync(path.resolve(__dirname, `./user/${this.phone}/videoLog/`), { recursive: true })
                    w_cfg_json(keys_, this.user_config)
                    resolve(keys_)
                })
            })
        })
    }

    async get_kwai_cp_ph(keys_) {
        console.log("stage: API_PH");
        return new Promise(resolve => {
            let Cookie = [
                'soft_did=1619580708547',
                'clientid=3',
                'language=zh-CN',
                `did=${keys_['did']}`,
                `userId=${keys_?.userId ?? keys_['userInfos'][this.flag]['userId']}`
            ]
            let us = new URLSearchParams()
            let ul = new URL(api['0x000003'])
            us.set('followUrl', 'https://cp.kuaishou.com/profile')
            us.set('setRootDomain', 'true')
            us.set('sid', 'kuaishou.web.cp.api')
            us.set('authToken', `${keys_['kuaishou.web.cp.api.at']}`)
            ul.search = us
            let cp_ph = https.request(ul, {
                method: "GET",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Farticle%252Fpublish%252Fvideo%253Forigin%253Dwww.kuaishou.com%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            cp_ph.setHeader('Cookie', Cookie)
            cp_ph.flushHeaders()
            cp_ph.addListener('response', resp => {
                resp.addListener('readable', () => {
                    w_cfg_json(JSON.parse(resp.read()), this.user_config)
                    resolve(null)
                })
            })
        })
    }
    async req_kwai_qr_code() {
        console.log("stage: REQ_QR_CODE");
        return new Promise(resolve => {
            let qrc_ct = 'sid=kuaishou.web.cp.api&channelType=PC_PAGE&encryptHeaders='
            let qrc = https.request(api['0x000014'], {
                method: "POST",
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            qrc.write(qrc_ct)
            qrc.end()
            qrc.addListener('response', resp => {
                resp.addListener('data', data => {
                    let { imageData, qrLoginToken, qrLoginSignature } = JSON.parse(data)
                    this.QR.qrLoginToken = qrLoginToken
                    this.QR.qrLoginSignature = qrLoginSignature
                    let dataBuffer = Buffer.from(imageData, 'base64')
                    // fs.writeFileSync('/node/PronCategorize/static/qrcode.png', dataBuffer, { encoding: 'binary' })
                    if (!fs.existsSync(this.user_config)) {
                        fs.mkdirSync(path.resolve(__dirname, `./user/${this.phone}/videoLog/`), { recursive: true })
                    }
                    fs.writeFileSync(path.resolve(__dirname, 'verify.png'), dataBuffer, { encoding: 'binary' })
                    resolve(null)
                })
            })
        })
    }
    async get_kwai_qr_scan() {
        console.log("stage: QR_SCAN");
        console.log("WAITING_USER_SCAN_CODE...");
        return new Promise(resolve => {
            let qrs_ct = `qrLoginToken=${this.QR.qrLoginToken}&qrLoginSignature=${this.QR.qrLoginSignature}&channelType=PC_PAGE&encryptHeaders=`
            let qrs = https.request(api['0x000015'], {
                method: "POST",
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Fprofile%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            qrs.write(qrs_ct)
            qrs.end()
            qrs.addListener('response', resp => {
                resp.addListener('data', data => {
                    console.log(data.toString());
                    resolve(null)
                })
            })
        })
    }
    async accpet_kwai_qr_result() {
        console.log("stage: QR_RESULT");
        return new Promise(resolve => {
            let qra_ct = `qrLoginToken=${this.QR.qrLoginToken}&qrLoginSignature=${this.QR.qrLoginSignature}&sid=kuaishou.web.cp.api&channelType=PC_PAGE&encryptHeaders=`
            let qra = https.request(api['0x000016'], {
                method: "POST",
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Fprofile%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            qra.write(qra_ct)
            qra.end()
            qra.addListener('response', resp => {
                resp.addListener('data', data => {
                    let { qrToken } = JSON.parse(data)
                    this.QR.qrToken = qrToken
                    resolve(null)
                })
            })
        })
    }

    async get_kwai_ph_qr() {
        console.log("stage: QR_PH_AT_ST");
        return new Promise(resolve => {
            let qrt_ct = `qrToken=${this.QR.qrToken}&sid=kuaishou.web.cp.api&channelType=PC_PAGE&encryptHeaders=`
            let qrt = https.request(api["0x000017"], {
                method: "POST",
                headers: {
                    "Host": "id.kuaishou.com",
                    "Origin": "https://passport.kuaishou.com",
                    "Referer": "https://passport.kuaishou.com/pc/account/login/?sid=kuaishou.web.cp.api&callback=https%3A%2F%2Fcp.kuaishou.com%2Frest%2Finfra%2Fsts%3FfollowUrl%3Dhttps%253A%252F%252Fcp.kuaishou.com%252Fprofile%26setRootDomain%3Dtrue",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            qrt.write(qrt_ct)
            qrt.end()
            qrt.addListener('response', resp => {
                let Cookie = Object.fromEntries(
                    new Map(
                        resp.headers['set-cookie']
                            .map(it => it.split(";")[0])
                            .map(it => it.split("="))
                    )
                )
                console.log(resp.headers['set-cookie']);
                resp.addListener('readable', () => {
                    let keys = { ...JSON.parse(resp.read()), ...Cookie }
                    fs.mkdirSync(path.resolve(__dirname, `./user/${this.phone}/videoLog/`), { recursive: true })
                    w_cfg_json(keys, this.user_config)
                    resolve(keys)
                })
            })
        })
    }
}

class KwaiFrame {
    constructor(vf, phone, flag = 0) {
        this.vf = vf
        this.cfg = null
        this.flag = flag || '0'
        this.cfg_vf = null
        this.phone = phone
        this.submit_pre_detail = null
        this.user_config = `user/${this.phone}/config`
        this.videoLog = `user/${this.phone}/videoLog/`
        this.cover = path.resolve(__dirname, this.videoLog, `${this.vf?.['fileBaseName']}.jpg`)
    }
    async get_kwai_up_tk() {
        // get config pre
        console.log("stage: START");
        this.cfg = r_cfg_json(this.user_config)
        return new Promise(reoslve => {
            let up_tk_ct = JSON.stringify({
                "uploadType": 1,
                "kuaishou.web.cp.api_ph": `${this.cfg['kuaishou.web.cp.api_ph']}`
            })
            let Cookie = [
                'soft_did=1619580708547',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`
            ]
            let up_tk = https.request(api['0x000004'], {
                agent: new https.Agent({
                    rejectUnauthorized: false
                    // ca:fs.readFileSync('./kuaishou.crt'),
                }),
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": "application/json;charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            up_tk.setHeader('Cookie', Cookie)
            up_tk.flushHeaders()
            up_tk.write(up_tk_ct)
            up_tk.end()
            up_tk.addListener('response', resp => {
                resp.addListener('readable', () => {
                    // console.log(resp.read().toString());
                    w_cfg_json(JSON.parse(resp.read()), this.user_config)
                    // get config tail
                    this.cfg = r_cfg_json(this.user_config)
                    reoslve(null)
                })
            })
        })
    }
    async req_kwai_bk_up() {
        console.log("stage: RESUME");
        return new Promise(resolve => {
            let ul = new URL(api['0x000005'])
            let us = new URLSearchParams()
            us.set('upload_token', this.cfg['data']['token'])
            ul.search = us
            let bk_up = https.request(ul, {
                method: "GET",
                headers: {
                    "Host": "upload.kuaishouzt.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
                }
            })
            bk_up.end()
            bk_up.addListener('response', resp => {
                resp.addListener('readable', () => {
                    // console.log(resp.read().toString());
                    resolve(null)
                })
            })
        })
    }
    async set_kwai_ft_up() {
        console.log("stage: FRAGMENT");
        return new Promise(async resolves => {
            let id = 0
            let ul = new URL(api['0x000006'])
            let us = new URLSearchParams()
            let f = fs.createReadStream(this.vf['file'], {
                highWaterMark: fragment_step_size,
                encoding: 'binary',
                autoClose: true
            })
            us.set('upload_token', this.cfg['data']['token'])
            f.addListener('data', async data => {
                // 生成Promise而非Promise队列
                await new Promise(resolve => {
                    if (data.length) {
                        us.set('fragment_id', id)
                        ul.search = us
                        let { x, y } = this.vf['fileFragmentSign'][id]
                        let ft_up = https.request(ul, {
                            method: "POST",
                            headers: {
                                "Host": "upload.kuaishouzt.com",
                                "Origin": "https://cp.kuaishou.com",
                                "Referer": "https://cp.kuaishou.com/",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                                "Content-Type": "application/octet-stream",
                            }
                        })
                        ft_up.setHeader("Content-Range", `cttes ${x}-${y}/${this.vf['fileLength']}`)
                        ft_up.flushHeaders()
                        ft_up.write(data, 'binary')
                        ft_up.end()
                        f.pause()
                        ft_up.addListener('response', resp => {
                            resp.addListener('data', dt => {
                                console.log(dt.toString());
                                f.resume()
                                resolve(null)
                                if (id++ == this.vf['fileFragmentAll'] - 1) {
                                    resolves(null)
                                }
                            })
                        })
                    }
                })
            })
        })
    }
    async set_kwai_ce_up() {
        console.log('stage: COMPELTE');
        return new Promise(resolve => {
            let ul = new URL(api['0x000007'])
            let us = new URLSearchParams()
            us.set('fragment_count', this.vf['fileFragmentAll'])
            us.set('upload_token', this.cfg['data']['token'])
            ul.search = us
            let ce_up = https.request(ul, {
                method: "POST",
                headers: {
                    "Host": "upload.kuaishouzt.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            ce_up.end()
            ce_up.addListener('response', resp => {
                resp.addListener('readable', () => {
                    // console.log(resp.read().toString());
                    resolve(null)
                })
            })
        })
    }
    async set_kwai_fh_up() {
        console.log('stage: FINISH');
        return new Promise(resolve => {
            let up_fh_ct = JSON.stringify({
                'fileLength': this.vf['fileLength'],
                //'fileLength': 1582949,
                'fileName': this.vf['fileName'],
                'fileType': this.vf['fileType'],
                'kuaishou.web.cp.api_ph': this.cfg['kuaishou.web.cp.api_ph'],
                'token': this.cfg['data']['token']
            })
            let Cookie = [
                'soft_did=1619580708547',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`,
                // 'lat=1.3612182',
                // 'lon=103.8862529'
            ]
            let fh_up = https.request(api['0x000008'], {
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": "application/json;charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            fh_up.setHeader('Cookie', Cookie)
            fh_up.flushHeaders()
            fh_up.write(up_fh_ct)
            fh_up.end()
            fh_up.addListener('response', resp => {
                resp.addListener('readable', () => {
                    w_cfg_json(JSON.parse(resp.read()), path.join(this.videoLog, this.vf['fileBaseName']))
                    this.cfg_vf = r_cfg_json(path.join(this.videoLog, this.vf['fileBaseName']))
                    resolve(null)
                })
            })

        })
    }
    async set_kwai_ready_payload() {
        this.submit_pre_detail = {
            'fileLength': this.vf['fileLength'],
            'fileName': this.vf['fileName'],
            'fileType': this.vf['fileType'],
            'fileSize': this.vf['fileSize'],
            'kuaishou.web.cp.api_ph': this.cfg['kuaishou.web.cp.api_ph'],
            'fileToken': this.cfg['data']['token'],
            'coverMediaId': this.cfg_vf['data']['coverMediaId'],
            'coverKey': this.cfg_vf['data']['coverKey'],
            'duration': this.cfg_vf['data']['videoDuration'] / 1000,
            'fileId': this.cfg_vf['data']['fileId'],
            'mediaId': this.cfg_vf['data']['mediaId'],
            'photoIdStr': this.cfg_vf['data']['photoIdStr'],
            'videoDuration': this.cfg_vf['data']['videoDuration'],
            'videoSizeHeight': this.cfg_vf['data']['height'],
            'videoSizeWidth': this.cfg_vf['data']['width'],
            'height': this.cfg_vf['data']['height'],
            'width': this.cfg_vf['data']['width'],
            allowSameFrame: true,
            caption: '',
            collectionId: '',
            coverCropped: false,
            coverTimeStamp: -1,
            coverTitle: '',
            coverType: 1,
            disableNearbyShow: false,
            domain: '',
            downloadType: 1,
            // innerChannel
            // latitude: 74.4847478,
            // longitude: 109.1478361,
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
        return null
    }

    async kwai_caption_metadata_hook(...tags) {

        let caption = this.vf['fileBaseName']

        tags.forEach(tag => caption = caption.replace(new RegExp(tag, "ig"), ''))

        return Reflect.set(this.submit_pre_detail, 'caption', caption)
    }
    async kwai_caption_tranfer_text() {

        let rawText = this.submit_pre_detail['caption']

        let targetText = await TranferText(rawText)

        return Reflect.set(this.submit_pre_detail, 'caption', targetText?.replace(/#/ig, '\u0020\u0020#') || rawText)
    }
    async mod_kwai_caption_hook(desc, ...tags) {
        if (!tags.length) { return null }   

        tags = tags.map(it => it ? `#${it}` : null).join(`\u0020\u0020`)

        if (desc) {
            return Reflect.set(this.submit_pre_detail, 'caption', `${desc}\u0020${tags} @catch_me_(O110986478) \n\n `)
        }
        // return Reflect.set(this.submit_pre_detail, 'caption', `${this.submit_pre_detail['caption']}\u0020${tags} @catch_me_(O110986478) \n\n `)
        return Reflect.set(this.submit_pre_detail, 'caption', `${this.submit_pre_detail['caption']}\u0020${tags} \n\n `)
    }
    async mod_kwai_allowSameFrame_hook(bool) {
        return Reflect.set(this.submit_pre_detail, 'allowSameFrame', bool)
    }
    async mod_kwai_downloadType_hook(num) {
        // allow 1  reject 2
        return Reflect.set(this.submit_pre_detail, 'downloadType', num)
    }
    async mod_kwai_disableNearbyShow_hook(bool) {
        // bool
        return Reflect.set(this.submit_pre_detail, 'disableNearbyShow', bool)
    }
    async mod_kwai_photoStatus_hook(num) {
        // public 1 protected 4  private 2 
        return Reflect.set(this.submit_pre_detail, 'photoStatus', num)
    }
    async mod_kwai_domain_hook(kind, subKind) {
        // pre num 
        Reflect.set(this.submit_pre_detail, 'domain', Domain['data'][`${kind}`]['firstDomain'])
        // next num 
        return Reflect.set(this.submit_pre_detail, 'secondDomain', Domain['data'][`${kind}`]['secondDomain'][`${subKind}`])
    }
    async mod_kwai_publishTime_hook(timestamp) {
        // timeStamp 
        return Reflect.set(this.submit_pre_detail, 'publishTime', timestamp)
    }

    async mod_kwai_cover_up(startTime) {
        console.log('stage: RADOM_FRMAE_COVER');
        Reflect.set(this.submit_pre_detail, 'coverCropped', true)
        Reflect.set(this.submit_pre_detail, 'coverType', 2)
        Reflect.set(this.submit_pre_detail, 'coverTimeStamp', -1)

        cp.execSync(`ffmpeg -y -i ${this.vf['file']} -hide_banner  -ss ${5} -frames:v 1 -f image ${this.cover}`, {
            // cp.execSync(`ffmpeg -y -i ${this.vf['file']} -hide_banner  -vf scale=1280:-1  -crf 0 -preset ultrafast  ${this.cover}`.replace('.jpg','.mp4'), {
            // cp.execSync(`ffmpeg -y -i ${this.vf['file']} -hide_banner  -vf scale=1280:-1  -r 144 -preset ultrafast  ${this.cover}`.replace('.jpg','.mp4'), {
            // cut video
            // cp.execSync(`ffmpeg -y -i ${this.vf['file']} -hide_banner  -vf crop=1280:520:0:100   ${this.cover}`.replace('.jpg','.mp4'), {
            // cp.execSync(`ffmpeg -y -i ${this.vf['file']} -hide_banner   -vf scale=800:-1  ${this.cover}`.replace('.jpg','.mp4'), {
            windowsHide: true,
            stdio: 'ignore'
        })
        // return null
        return new Promise(resolve => {
            let part_ct = new FormData()
            part_ct.append('kuaishou.web.cp.api_ph', this.cfg['kuaishou.web.cp.api_ph'])
            part_ct.append('file', fs.createReadStream(this.cover))
            let Cookie = [
                'soft_did=1619580708547',
                'language=zh-CN',
                'clientid=3',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`,
                // 'lat=1.3612182',
                // 'lon=103.8862529'

            ]
            let cr_up = https.request(api['0x000013'], {
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": `multipart/form-data; boundary=${part_ct.getBoundary()}`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            cr_up.setHeader('Cookie', Cookie)
            cr_up.flushHeaders()
            part_ct.pipe(cr_up)
            cr_up.addListener('response', resp => {
                resp.addListener('readable', () => {
                    Reflect.set(this.submit_pre_detail, 'coverKey', JSON.parse(resp.read())['data']['coverKey'])
                    resolve(null)
                })
            })
        })
    }
    async set_kwai_se_up() {
        console.log('stage: SAVE');
        return new Promise(resolve => {
            // console.log( this.submit_pre_detail);
            let up_se_ct = JSON.stringify(this.submit_pre_detail)
            let Cookie = [
                'soft_did=1619580708547',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`,
                // 'lat=1.3612182',
                // 'lon=103.8862529'
            ]
            let se_up = https.request(api['0x000009'], {
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": "application/json;charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            se_up.setHeader('Cookie', Cookie)
            se_up.flushHeaders()
            se_up.write(up_se_ct)
            se_up.end()
            se_up.addListener('response', resp => {
                resp.addListener('readable', () => {
                    // console.log(resp.read().toString());
                    resolve(null)
                })
            })
        })
    }
    async req_kwai_rm_up() {
        return new Promise(resolve => {
            let rm_up_ct = JSON.stringify({
                'kuaishou.web.cp.api_ph': `${this.cfg['kuaishou.web.cp.api_ph']}`,
            })
            let Cookie = [
                'soft_did=1619580708547',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`,
                // 'lat=1.3612182',
                // 'lon=103.8862529'
            ]
            let up_rm = https.request(api['0x000010'], {
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": "application/json;charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            up_rm.setHeader('Cookie', Cookie)
            up_rm.flushHeaders()
            up_rm.write(rm_up_ct)
            up_rm.end()
            up_rm.addListener('response', resp => {
                resp.addListener('readable', () => {
                    // console.log(resp.read().toString());
                    resolve(null)
                })
            })
        })
    }
    async set_kwai_st_re() {
        console.log('satge: SUBMIT');
        return new Promise(resolve => {
            let re_st_ct = JSON.stringify(this.submit_pre_detail)
            let Cookie = [
                'soft_did=1619580708547',
                `did=${this.cfg['did']}`,
                `userId=${this.cfg?.userId ?? this.cfg['userInfos'][this.flag]['userId']}`,
                `kuaishou.web.cp.api_st=${this.cfg['kuaishou.web.cp.api_st']}`,
                `kuaishou.web.cp.api_ph=${this.cfg['kuaishou.web.cp.api_ph']}`,
                // 'lat =74.4847478',
                // 'lon= 109.1478361'
            ]

            let st_re = https.request(api['0x000011'], {
                method: "POST",
                headers: {
                    "Host": "cp.kuaishou.com",
                    "Origin": "https://cp.kuaishou.com",
                    "Referer": "https://cp.kuaishou.com/article/publish/video",
                    "Content-Type": "application/json;charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                }
            })
            st_re.setHeader('Cookie', Cookie)
            st_re.flushHeaders()
            st_re.write(re_st_ct)
            st_re.end()
            st_re.addListener('response', resp => {
                resp.addListener('readable', () => {
                    console.log(resp.read().toString());
                    resolve(null)
                })
            })
        })
    }

}

function f_pe(tfp) {
    let abs = path.resolve(__dirname, tfp)
    let sts = fs.statSync(abs, { throwIfNoEntry: true })
    let ext = path.extname(abs)
    let fbe = path.basename(abs)
    let size = sts.size
    let x = 0, y = 0, c = []
    while (size >= fragment_step_size) {
        size = size - fragment_step_size;
        [x, y] = [y, y + fragment_step_size]
        c.push({ x, y: y - 1 })
    }
    if (sts.size % fragment_step_size) {
        [x, y] = [y, sts.size - 1]
        c.push({ x, y })
    }
    if (fs.existsSync(abs)) {
        return {
            'file': abs,
            'ext': ext,
            'fileName': fbe,
            'fileType': Reflect.get(MineType, ext.replace('.', '')),
            'fileSize': `${Number(sts.size / Math.pow(1024, 2)).toFixed(1)}MB`,
            'fileLength': sts.size,
            'fileBaseName': fbe.replace(ext, ''),
            'fileFragmentAll': Math.ceil(sts.size / fragment_step_size),
            'fileFragmentSign': c,
        }
    } else {
        throw new Error('FILE_NOT_FOUND')
    }
}
function sleep(dely) {
    return new Promise(resolve => {
        setTimeout(resolve, dely)
    })
}

function readline() {
    return new Promise(resolve => {
        process.stdin.resume()
        process.stdin.addListener("data", dt => {
            process.stdin.pause()
            resolve(dt.toString())
        })
    })
}

function r_cfg_json(fp) {
    fp = path.resolve(__dirname, `${fp}.json`)
    if (fs.existsSync(fp)) {
        return JSON.parse(
            fs.readFileSync(fp, {
                flag: "r",
                encoding: 'utf-8'
            }) || "{}"
        )
    } else {
        console.log('PATH_NOT_FOUND');
        return {}
    }

}

function w_cfg_json(cfg, fp) {
    fs.writeFileSync(path.resolve(__dirname, `${fp}.json`), JSON.stringify({...r_cfg_json(fp),...cfg,}), {
        flag: 'w',
        encoding: 'utf-8',
    })
}


async function LOGIN_SMS_CODE(u) {

    let kwai = new Kwai(u, 0)

    // sms_code need verify
    kwai.req_kwai_sms_code()

    let sms_code = await readline()

    let keys = await kwai.get_kwai_ph_at(sms_code)
    // console.log(keys)
    if (keys['multiUserToken']) {
        let keys_ = await kwai.cho_kwai_mt_us(keys)
        console.log(keys_);
        await kwai.get_kwai_cp_ph(keys_)

    } else {
        await kwai.get_kwai_cp_ph(keys)
    }


}
async function LOGIN_QR_CODE(u) {
    let kwai = new Kwai(u, 0)

    await kwai.req_kwai_qr_code()

    await kwai.get_kwai_qr_scan()

    console.log("Please enter 'yes' after scanning");

    let result = await readline()

    if (result.includes('y')) {

        await kwai.accpet_kwai_qr_result()

        let keys = await kwai.get_kwai_ph_qr()

        await kwai.get_kwai_cp_ph(keys)
    }
}
async function LOAD_FILE(vf, u) {

    console.log('[Kwai]: Push Kwaif Process');

    let kwaiFrame = new KwaiFrame(vf, u)

    await kwaiFrame.get_kwai_up_tk()

    await kwaiFrame.req_kwai_bk_up()

    await kwaiFrame.set_kwai_ft_up()

    await kwaiFrame.set_kwai_ce_up()

    await kwaiFrame.set_kwai_fh_up()

    await kwaiFrame.set_kwai_ready_payload()

    // await kwaiFrame.mod_kwai_cover_up(5)

    await kwaiFrame.kwai_caption_metadata_hook('#shorts', '#youtube')

    await kwaiFrame.kwai_caption_tranfer_text()

    // await kwaiFrame.mod_kwai_caption_hook()

    await kwaiFrame.mod_kwai_caption_hook(null,'lofi','beat','chill')

    await kwaiFrame.set_kwai_se_up()

    // await kwaiFrame.req_kwai_rm_up()

    await kwaiFrame.set_kwai_st_re()

    fs.rmSync(vf.file)
    
    console.log('[Kwai]: Push Done');
    
}
async function Specifies() {

    let queue_f = fs.readdirSync(path.resolve(__dirname, './video'))

    if (!queue_f.length) return null

    let vf = f_pe(`${path.resolve(path.resolve(__dirname, './video/'), queue_f[0])}`);

    LOAD_FILE(vf, u1)
}
async function auto() {

    let queue_f = fs.readdirSync(path.resolve(__dirname, './video'))

    if (!queue_f.length) return null

    let vf = f_pe(`${path.resolve(path.resolve(__dirname, './video/'), queue_f[0])}`);

    // hook title
    if (/.*[\u4e00-\u9fa5]+.*$/.test(vf.file)) {
        //fs.rmSync(vf.file)
        //return null
    }
    LOAD_FILE(vf, u1)
}
if (process.argv[2] == '-l') {
    LOGIN_QR_CODE(process.argv[3] || u1)
}
if (process.argv[2] == '-t') {
    console.log(process.argv);
    let time = '1 30 16 * * *'
    // let time = '1 1 */4 * * *'
    const job = schedule.scheduleJob(time, async (currentTime) => {
        await auto()
    })
}
console.log(process.argv);
auto()
process.addListener('uncaughtException', console.log)
process.addListener('unhandledRejection', console.log)
process.addListener('uncaughtExceptionMonitor', console.log)
