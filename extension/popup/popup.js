/**
 * GovBridge RPA Recorder - Popup Script
 */

const BACKEND_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("popup-status");
  const idleControls = document.getElementById("idle-controls");
  const activeControls = document.getElementById("active-controls");
  const btnStart = document.getElementById("btn-start-record");
  const btnStop = document.getElementById("btn-stop-record");
  const btnPortal = document.getElementById("btn-open-portal");
  const btnDemo = document.getElementById("btn-open-demo");

  // Check state
  chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (data) => {
    if (data && data.isRecording) {
      showRecordingState();
    } else {
      showIdleState();
    }
  });

  function showRecordingState() {
    statusBadge.innerText = "RECORDING";
    statusBadge.className = "status-badge status-recording";
    idleControls.style.display = "none";
    activeControls.style.display = "block";
  }

  function showIdleState() {
    statusBadge.innerText = "IDLE";
    statusBadge.className = "status-badge status-idle";
    idleControls.style.display = "block";
    activeControls.style.display = "none";
  }

  btnStart.onclick = () => {
    chrome.runtime.sendMessage({ type: "START_RECORDING" }, (res) => {
      if (res && res.success) {
        showRecordingState();
        window.close();
      }
    });
  };

  btnStop.onclick = () => {
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" }, (res) => {
      showIdleState();
      window.close();
    });
  };

  btnPortal.onclick = () => {
    chrome.tabs.create({ url: `${BACKEND_URL}/builder` });
    window.close();
  };

  btnDemo.onclick = () => {
    chrome.tabs.create({ url: `${BACKEND_URL}/demo-target` });
    window.close();
  };
});
