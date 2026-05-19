const resultEl = document.querySelector("#result");
const statusEl = document.querySelector("#status");
const copyButton = document.querySelector("#copy-button");
const refreshButton = document.querySelector("#refresh-button");

const AIRPORTS = [
  { title: "KOTA KINABALU", icao: "WBKK" },
  { title: "LABUAN", icao: "WBKL" },
  { title: "BRUNEI", icao: "WBSB" },
  { title: "MIRI", icao: "WBGR" },
  { title: "BINTULU", icao: "WBGB" },
  { title: "YANGON", icao: "VYYY" },
];

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#aa2f24" : "";
}

function normalizeTaf(raw) {
  return (raw || "").replace(/\s+/g, " ").trim();
}

function buildSection(title, raw) {
  return `${title}\n${raw || "No current TAF available"}`;
}

function buildOutput(results) {
  const borneoBlock = results
    .slice(0, 5)
    .map((item) => buildSection(item.title, item.raw))
    .join("\n\n");

  const yangonBlock = buildSection(results[5].title, results[5].raw);

  return `TAF\n${borneoBlock}\n\nTAF\n${yangonBlock}`;
}

async function fetchAirport(airport) {
  const response = await fetch(`/api/taf?icao=${encodeURIComponent(airport.icao)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${airport.icao}: ${payload.error || "Fetch failed"}`);
  }

  return {
    ...airport,
    raw: normalizeTaf(payload.raw),
  };
}

async function fetchAllTaf() {
  setStatus("Fetching the latest TAFs for the fixed airport list...");
  resultEl.textContent = "Loading...";

  try {
    const results = await Promise.all(AIRPORTS.map(fetchAirport));
    resultEl.textContent = buildOutput(results);
    setStatus(`Updated the latest TAFs for ${AIRPORTS.length} fixed airports.`);
  } catch (error) {
    resultEl.textContent = "Unable to fetch data";
    setStatus(error.message || "Fetch failed", true);
  }
}

refreshButton.addEventListener("click", () => {
  fetchAllTaf();
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    setStatus("Output copied to clipboard.");
  } catch (_error) {
    setStatus("Copy failed. Please copy the text manually.", true);
  }
});

fetchAllTaf();
