const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const startButton = document.getElementById("startVerification");

let referenceDescriptor = null; // Stores reference face

// Start the camera
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        statusText.innerText = "Camera access granted!";
    } catch (err) {
        console.error("Camera access error:", err);
        statusText.innerText = "❌ Camera access denied!";
    }
}


// Load Face-api.js models
async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
    await faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
    await faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
}

// Capture reference face (simulating account registration)
async function captureReferenceFace() {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
        statusText.innerText = "No face detected. Try again.";
        return;
    }
    referenceDescriptor = detections.descriptor;
    statusText.innerText = "Face captured. Click 'Start Verification'.";
}

// Verify user identity
async function verifyFace() {
    if (!referenceDescriptor) {
        statusText.innerText = "Please save a reference face first!";
        return;
    }

    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
        statusText.innerText = "Face not detected!";
        return;
    }

    // Compare with reference face
    const faceMatcher = new faceapi.FaceMatcher(referenceDescriptor);
    const match = faceMatcher.findBestMatch(detections.descriptor);

    if (match.distance < 0.5) { // Lower = better match
        statusText.innerText = "✅ Verification successful!";
        setTimeout(() => window.close(), 2000); // Close after 2 sec
    } else {
        statusText.innerText = "❌ Verification failed!";
    }
}

// Start everything
startButton.addEventListener("click", verifyFace);
video.addEventListener("play", () => setInterval(captureReferenceFace, 5000)); // Capture face every 5s

// Initialize
(async function init() {
    await loadModels();
    startVideo();
})();
