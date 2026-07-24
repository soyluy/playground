# livestream-api

Standalone NestJS practice app for camera-style **HLS livestreaming** with ffmpeg. Not part of Hub — it lives in this monorepo so it can share tooling/libs later if useful.

POC shape: start a stream per `cameraId`, burn an optional text watermark, write HLS playlist + segments under `tmp/streams/`, and serve them over HTTP for a player (e.g. hls.js). Source for the POC is a public test HLS URL, not a real camera registry.

## Endpoints

| Method | Path | Role |
| --- | --- | --- |
| `POST` | `/api/stream/:cameraId/start` | Spawn ffmpeg → HLS (one process per camera) |
| `DELETE` | `/api/stream/:cameraId/stop` | Kill that stream |
| `GET` | `/api/stream/:cameraId/index.m3u8` | Playlist |
| `GET` | `/api/stream/:cameraId/:segment` | `.ts` segments |

Requires **ffmpeg** on the host (`PATH`). Uses `ffmpeg-static` / system ffmpeg depending on how you run it — the service shells out to `ffmpeg`.

## Run

From the monorepo root (`js-monorepo/`):

```bash
npx nx serve livestream-api
```

Default port **3000**, global prefix `api`.

## Stack

NestJS · ffmpeg (HLS, optional drawtext watermark) · Express response streaming for playlist/segments
