const params = new URLSearchParams(window.location.search);

let daysPerYear = params.get("daysperyear") ? Number(params.get("daysperyear")) : 14;
let lastDateChange = params.get("lastdatechange")
  ? Number(params.get("lastdatechange"))
  : Date.parse("2025-09-01");
let lastDateEpoch = params.get("lastdateepoch")
  ? Number(params.get("lastdateepoch"))
  : Date.parse("2044-07-01");
let fixedYears = params.get("fixedyears")
  ? params.get("fixedyears") === "true"
  : true;

function fillInputs() {
  document.getElementById("daysPerYear").value = daysPerYear;
  document.getElementById("lastDateChange").value = new Date(lastDateChange).toISOString().split("T")[0];
  document.getElementById("lastDateEpoch").value = new Date(lastDateEpoch).toISOString().split("T")[0];
  document.getElementById("fixedYears").checked = fixedYears;
}

function getSettingsUrl() {
  return `${window.location.origin}${window.location.pathname}?daysperyear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
}

function applySettings() {
  daysPerYear = Number(document.getElementById("daysPerYear").value);
  lastDateChange = new Date(document.getElementById("lastDateChange").value).getTime();
  lastDateEpoch = new Date(document.getElementById("lastDateEpoch").value).getTime();
  fixedYears = document.getElementById("fixedYears").checked;

  window.history.replaceState({}, "", getSettingsUrl());
  updateCurrentRpTime();
}

function getTimeOf(irlDate) {
  if (!fixedYears) {
    return new Date(
      Math.floor((365 / daysPerYear) * (irlDate - lastDateChange) + lastDateEpoch)
    );
  }

  const day = 86400000;
  const timeDifference = irlDate - lastDateChange;
  const years = timeDifference / (day * daysPerYear);
  const yearCount = Math.floor(years);

  const baseDate = new Date(lastDateEpoch);

  const earlyDateObj = new Date(baseDate);
  earlyDateObj.setFullYear(baseDate.getFullYear() + yearCount);
  const earlyDate = earlyDateObj.getTime();

  const latestDateObj = new Date(baseDate);
  latestDateObj.setFullYear(baseDate.getFullYear() + yearCount + 1);
  const latestDate = latestDateObj.getTime();

  const yearLength = latestDate - earlyDate;
  const rest = (years - yearCount) * yearLength;

  return new Date(earlyDate + rest);
}

function formatDate(date) {
  return date.toLocaleString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
  }) + " UTC";
}

function updateCurrentRpTime() {
  const rpDate = getTimeOf(Date.now());
  document.getElementById("currentRpDate").textContent = formatDate(rpDate);
}

function getSingleRPTime() {
  const dateValue = document.getElementById("singleDate").value;
  const timeValue = document.getElementById("singleTime").value;
  const offsetValue = Number(document.getElementById("singleOffset").value);

  if (!dateValue || !timeValue) {
    document.getElementById("singleRpDate").textContent = "Preenche a data e a hora.";
    return;
  }

  const [hours, minutes] = timeValue.split(":").map(Number);
  const dateMs = new Date(dateValue).getTime();
  const timeMs = (hours * 60 + minutes) * 60000;
  const offsetMs = offsetValue * 3600000;

  const finalMs = dateMs + timeMs - offsetMs;
  const rpDate = getTimeOf(finalMs);

  document.getElementById("singleRpDate").textContent = formatDate(rpDate);
}

fillInputs();
updateCurrentRpTime();
setInterval(updateCurrentRpTime, 1000);