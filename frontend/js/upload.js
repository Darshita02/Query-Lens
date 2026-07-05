const API = "http://localhost:5000";

// ── DOM refs ──────────────────────────────────────────
const dropzone       = document.getElementById("dropzone");
const fileInput      = document.getElementById("fileInput");
const uploadStatus   = document.getElementById("uploadStatus");
const uploadStatusTxt= document.getElementById("uploadStatusText");
const errorBanner    = document.getElementById("errorBanner");
const errorText      = document.getElementById("errorText");

// ── Drag and drop ─────────────────────────────────────
dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

dropzone.addEventListener("click", (e) => {
    if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
        fileInput.click();
    }
});

fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// ── File upload handler ───────────────────────────────
async function handleFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
        showErr("Only .csv, .xlsx, and .xls files are supported.");
        return;
    }

    showStatus(`Uploading ${file.name}…`);
    clearErr();

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res  = await fetch(`${API}/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();

        if (data.error) {
            showErr(data.error);
            hideStatus();
            return;
        }

        // Save profile and table name for dashboard + profile pages
        sessionStorage.setItem("ql_profile", JSON.stringify(data));
        sessionStorage.setItem("ql_table",   data.table_name);

        showStatus("Dataset ready — taking you to the dashboard…");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 800);

    } catch {
        showErr("Cannot connect to the server. Make sure Flask is running on port 5000.");
        hideStatus();
    }
}

// ── Sample dataset loader ─────────────────────────────
async function loadSample(filename) {
    showStatus(`Loading ${filename}…`);
    clearErr();

    try {
        const res  = await fetch(`${API}/load_sample`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename })
        });
        const data = await res.json();

        if (data.error) {
            showErr(data.error);
            hideStatus();
            return;
        }

        sessionStorage.setItem("ql_profile", JSON.stringify(data));
        sessionStorage.setItem("ql_table",   data.table_name);

        showStatus("Sample loaded — taking you to the dashboard…");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 800);

    } catch {
        showErr("Cannot connect to the server. Make sure Flask is running on port 5000.");
        hideStatus();
    }
}

// ── Helpers ───────────────────────────────────────────
function showStatus(msg) {
    uploadStatus.style.display = "flex";
    uploadStatusTxt.textContent = msg;
}

function hideStatus() {
    uploadStatus.style.display = "none";
}

function showErr(msg) {
    errorBanner.style.display = "block";
    errorText.textContent = msg;
}

function clearErr() {
    errorBanner.style.display = "none";
}