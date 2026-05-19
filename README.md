# TAF Formatter

This is a simple local web tool for fetching the latest TAFs and formatting them into a fixed output layout.

## Features

- Fetches the latest TAFs from the official Aviation Weather Center API through a local proxy
- Avoids the browser CORS restriction on the official API
- Outputs the fixed airport list in the required text format
- Supports one-click copy of the final output

## Run

On Windows, you can run:

```bat
start-server.cmd
```

If Node.js is not available in PATH, you can also run the bundled runtime directly:

```bash
"/mnt/c/Users/nlin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe" "/mnt/c/Users/nlin/Documents/Codex/2026-05-19/new-chat/server.js"
```

Then open:

`http://localhost:3000`

## Deploy To Render

This project is ready to deploy to Render as a Node.js web service.

### Option 1: Deploy from GitHub

1. Push this folder to a GitHub repository.
2. Sign in to [Render](https://render.com/).
3. Click `New +` and choose `Web Service`.
4. Connect your GitHub repository.
5. Render should detect the included [render.yaml](/mnt/c/Users/nlin/Documents/Codex/2026-05-19/new-chat/render.yaml:1) automatically.
6. If you configure it manually, use:

```text
Runtime: Node
Build Command: true
Start Command: npm start
```

7. Deploy the service and wait for Render to assign a public URL.

### Option 2: Blueprint Deploy

Because this repo includes `render.yaml`, you can also create the service as a Render Blueprint and let Render import the settings automatically.

### Notes For Render

- The server already uses `process.env.PORT`, which Render provides automatically.
- This app has no external npm dependencies, so deployment is lightweight.
- The free plan may sleep after inactivity, so the first request can be slower.

## Data Source

- Official docs: [Aviation Weather Center Data API](https://aviationweather.gov/data/api/)
- TAF endpoint: `https://aviationweather.gov/api/data/taf?ids=RJTT&format=raw`

## Notes

- The official docs currently indicate that `/api/data` cannot be called directly from browser frontends because of CORS, so this project uses a local proxy.
- The current implementation fetches `raw` TAF text and formats the fixed airport list directly.
- If you want, this can be extended later to export `.txt` files or add alternate output layouts.
