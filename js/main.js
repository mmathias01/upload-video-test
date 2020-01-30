
'use strict';

var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
var library = document.querySelector('input#library');
var camera = document.querySelector('input#camera');

var s3Region = "us-east-1";
var s3BucketName = "gyro-corning-video-test";

// Initialize the Amazon Cognito credentials provider
AWS.config.region = s3Region; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:bd551a51-40c2-4457-bab5-583635c768c2',
});


library.addEventListener('change', uploadVideo);
camera.addEventListener('change', uploadVideo);

videoSelect.onchange = getStream;

getStream().then(getDevices).then(gotDevices);

function getDevices() {
  // AFAICT in Safari this only gets default devices until gUM is called :/
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos; // make available to console
  console.log('Available input and output devices:', deviceInfos);
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
    //   option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
    //   audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  //const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    //audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  return navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  //audioSelect.selectedIndex = [...audioSelect.options].findIndex(option => option.text === stream.getAudioTracks()[0].label);
  videoSelect.selectedIndex = [...videoSelect.options].
    findIndex(option => option.text === stream.getVideoTracks()[0].label);
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}

function uploadVideo(event) {
  var files = event.target.files;
  
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  
  var file = files[0];
  var fileName = file.name;
  // Use S3 ManagedUpload class as it supports multipart uploads
  console.log(file)
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: s3BucketName,
      Key: fileName,
      Body: file,
      ACL: "public-read"
    }
  });

  var promise = upload.promise();

  promise.then(
    function(data) {
      alert("Successfully uploaded photo.");
    },
    function(err) {
      console.log(err)
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}



//input.addEventListener('change', updateImageDisplay);