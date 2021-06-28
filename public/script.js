const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: 'rooms-peerjs.herokuapp.com',
  secure: true,
  port: 443
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const method = urlParams.get('method')
if(method == "screen") {
    navigator.mediaDevices.getDisplayMedia().then(stream => {
    addVideoStream(myVideo, stream)
  
    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})
}
else {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      }).then(stream => {
      addVideoStream(myVideo, stream)
    
      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })
      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}
$("#start-screenshare").click(function() {
  if(window.confirm("This feature is still currently being developed, and may not be fully functional. Are you sure you want to proceed? \n\nKnown bug: The screenshare does not automatically appear for the other members of the call, and they must refresh their pages before they will be able to see it. \n\nNote: You must allow pop-ups with your browser for this to work.")) {
    window.open("../" + ROOM_ID + "?method=screen")
    $("#start-screenshare").hide()
  }
})
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

