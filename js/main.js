
'use strict';

var library = document.querySelector('input#library');
var camera = document.querySelector('input#camera');
var buttons = document.querySelector('#buttons');
var loader = document.querySelector('.loader');

var s3Region = "us-east-1";
var s3BucketName = "gyro-corning-video-test";

// Initialize the Amazon Cognito credentials provider
AWS.config.region = s3Region; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:bd551a51-40c2-4457-bab5-583635c768c2',
});


library.addEventListener('change', uploadVideo);
camera.addEventListener('change', uploadVideo);




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

  buttons.classList.add('hidden')
  loader.classList.remove('hidden')
  var promise = upload.promise();

  promise.then(
    function(data) {
      buttons.classList.remove('hidden')
      loader.classList.add('hidden')
      alert("Successfully uploaded video.");      
    },
    function(err) {
      console.log(err)
      buttons.classList.remove('hidden')
      loader.classList.add('hidden')
      return alert("There was an error uploading your video: ", err.message);
    }
  );
}



//input.addEventListener('change', updateImageDisplay);