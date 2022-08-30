

const APP_ID = "b43cdbc9752149b1a5eac7f4f17ef11f"

console.log(`USER ID IS ${nuserid}`)
console.log(`CHANNEL IS ${CHANNEL}`)
let players
let videodivs
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let video_streams = []
let remoteUsers = {}
let remoteUsersarr = []



function fetchToken(uid, channelName, tokenRole) {

    return new Promise(function (resolve) {
        axios.post('http://localhost:8082/fetch_rtc_token', {
            uid: uid,
            channelName: channelName,
            role: tokenRole
        }, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        })
            .then(function (response) {
                const token = response.data.token;
                resolve(token);
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}


let joinAndDisplayLocalStream = async () => {
    const TOKEN = await fetchToken(nuserid, CHANNEL, 1)
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    console.log("============================================")
    console.log(`
        Joining with ${APP_ID}
        CHANNEL = ${CHANNEL}
        TOKEN = ${TOKEN}
        USERID = ${nuserid}
    `)
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, nuserid)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="agoravideo-container-local" id="user-container-${UID}">
                        <div class="video-player-local" id="user-${UID}"></div>
                  </div>`
    document.getElementById('local-stream').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
    document.querySelector(".video-player-local > div").style.position = "static";

    document.querySelector(".video-player-local video").style["border-radius"] = "0.5rem";
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    // document.getElementById('join-btn').style.display = 'none'
    // document.getElementById('stream-controls').style.display = 'flex'
}

let isFirst = true;
let streamid = 0;
// When token-privilege-will-expire occurs, fetches a new token from the server and call renewToken to renew the token.

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    remoteUsersarr.push(user.uid)
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }

        player = `<div class="agoravideo-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`

                 document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        if (remoteUsersarr.length == 2) {

            let ismain = document.querySelector(".agoravideo-container").classList.contains("main-vid");
            if (ismain) {
                document.querySelector(".agoravideo-container").classList.remove("main-vid");
            }
            document.querySelector(".agoravideo-container").classList.add("main-vid-full");

        }
        else {
            let ismainfull = document.querySelector(".agoravideo-container").classList.contains("main-vid-full");
            if (ismainfull) {
                document.querySelector(".agoravideo-container").classList.remove("main-vid-full");

            }
            document.querySelector(".agoravideo-container").classList.add("main-vid");
        }



        user.videoTrack.play(`user-${user.uid}`)
        players = document.querySelectorAll(".video-player > div")
        players[players.length - 1].style.position = "static";


        videodivs = document.querySelectorAll(".video-player video")
        videodivs[videodivs.length - 1].style["border-radius"] = "0.5rem";

    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}
client.on("token-privilege-will-expire", async function () {
    let token = await fetchToken(uid, options.channel, 1);
    await client.renewToken(token);
});

// When token-privilege-did-expire occurs, fetches a new token from the server and call join to rejoin the channel.
client.on("token-privilege-did-expire", async function () {
    console.log("Fetching the new Token")
    let token = await fetchToken(uid, options.channel, 1);
    console.log("Rejoining the channel with new Token")
    await rtc.client.join(options.appId, options.channel, token, uid);
});

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = 'cadetblue'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = 'cadetblue'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = '#EE4B2B'
    }
}
setTimeout(joinStream, 2000)
document.getElementById('call-end').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('microphone').addEventListener('click', toggleMic)
document.getElementById('camera').addEventListener('click', toggleCamera)