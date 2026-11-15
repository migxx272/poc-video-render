# PoC: vídeo 3D low-poly renderizado no GitHub Actions

Prova de conceito da arquitetura descrita em `ARQUITETURA.md` (não incluído neste repo):
renderizar uma cena three.js **sem GPU**, usando Chromium headless com WebGL por
software (SwiftShader) num runner do GitHub Actions, e empacotar em MP4 com FFmpeg.

**Conteúdo da cena:** personagem low-poly procedural que anda (0–5 s) e acena
(5–10 s), ambiente com árvores e casa, câmera com dolly. 10 s a 24 fps = 240 frames.

## Como funciona

1. `render.js` sobe um servidor HTTP local, abre o Chromium (Puppeteer) com
   SwiftShader forçado, carrega a cena (`scene/`) e captura frame a frame
   de forma determinística (`window.tick(i)`).
2. O workflow `.github/workflows/render.yml` roda isso num runner `ubuntu-latest`,
   codifica os frames com FFmpeg (H.264, yuv420p) e publica o MP4 numa release
   do próprio repositório.

## Disparar manualmente

Aba **Actions** → **PoC — render 3D** → **Run workflow**.

## Notas de segurança

Este repositório contém apenas o motor de render genérico. Roteiros, narrações,
credenciais e artefatos de produção ficam fora dele (ver regra em `ARQUITETURA.md`).
