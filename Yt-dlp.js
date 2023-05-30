const https = require('https')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const schedule = require('node-schedule')
const { log } = require('console')
const readline = require('readline')
const { stdin: input, stdout: output } = require('process');
let short = 'https://www.youtube.com/youtubei/v1/reel/reel_item_watch'
async function getConfig(URL_) {
    let raw = ''
    await new Promise(res => {
        let temp = ""
        let req = https.request(URL_, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'origin': 'https://www.youtube.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.70'
            }
        })
        req.addListener('response', resp => {
            resp.setEncoding('utf-8')
            resp.addListener('readable', () => {
                if (!((temp = resp.read()) == null)) {
                    raw += temp
                }
            })
            resp.addListener('end', () => {
                res(raw)
            })
        })
        let content = require('./resource/YoutbueReel.json')
        req.write(JSON.stringify(content))
        req.end()
    })
    return raw
}
function rfs() {
    return fs.readFileSync(path.resolve(__dirname, './resource/VideoList.json'), { flag: 'a+', encoding: "utf-8" }) || []
}
function wfs(videoId) {
    let Ids = JSON.parse(rfs())
    Ids.push(videoId)
    return fs.writeFileSync(path.resolve(__dirname, './resource/VideoList.json'), JSON.stringify(Ids), { flag: 'w+', encoding: 'utf-8' })
}
function iex(videoId) {
    let Ids = JSON.parse(rfs())
    return !(Ids.some(item => {
        return videoId == item
    }))
}
async function dly(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(null)
        }, time);
    })
}
async function ytdl() {
    await dly(2000)
    let ul = new URL(short)
    let us = new URLSearchParams()
    us.append('key', 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8')
    us.append('prettyPrint', false)
    ul.search = us
    let raw = await getConfig(ul)
    let vidoeRenderer = JSON.parse(raw)
    let target = vidoeRenderer?.['overlay']?.['reelPlayerOverlayRenderer']?.['likeButton']?.['likeButtonRenderer']
    let videoId = target?.['target']?.['videoId']
    return videoId ? { url: `https://www.youtube.com/shorts/${videoId}`, likeCount: target?.['likeCount'] } : null
}
function repl(vul) {
    log("[Yt-dlp]:Execute Repl Process");
    // dl
    cp.execSync(`yt-dlp_linux -o '${path.resolve(__dirname, './video')}/%(title)s.%(ext)s' ${vul}`, {
        windowsHide: true,
        stdio: 'inherit'
    })
    // up
    cp.execSync(`node ${path.resolve(__dirname, './KawiCarry.js')}`, {
        windowsHide: true,
        stdio: 'inherit'
    })
    
    wfs(vul)
}

async function main() {
    log("[Yt-dlp]:Get Youtube Origin");
    // auto
    let vu = await ytdl()

    vu.url = vu.url.replace('?feature=share','').replace('youtube','www.youtube')

    console.log(vu)

    if ((vu.likeCount > Number(process.argv[3])) && iex(vu.url)) {
        repl(vu.url)
        return null
    }
    main()
}
if (process.argv[2] == '-s') {
    // Specifies
    repl(process.argv[3])
}

if (process.argv[2] == '-m') {
    //main()
    log(process.argv)
    let time = '1 1 * * * *'
    const job = schedule.scheduleJob(time, async (currentTime) => {
        await main()
    })
}
if (process.argv[2] == '-b') {
    const rl = readline.createInterface({ input, output });
    cp.execSync(`yt-dlp_linux  --cookies ./cookie/bilibili.txt -F ${process.argv[3]}`, {
        windowsHide: true,
        stdio: 'inherit'
    })
    rl.question('select resource ID\n', (answer) => {
        cp.execSync(`yt-dlp_linux --cookies ./cookie/bilibili.txt -f ${answer} -o '/node/kwai_merger/video/ %(title)s.%(ext)s' ${process.argv[3]}`, {
            windowsHide: true,
            stdio: 'inherit'
        })
        rl.close();
    });

}

process.addListener('uncaughtException', console.log)
process.addListener('unhandledRejection', console.log)
process.addListener('uncaughtExceptionMonitor', console.log)

log('https://youtube.com/shorts/_MG8tBb1jKg?feature=share')
