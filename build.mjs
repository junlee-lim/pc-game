// src/*.js 를 순서대로 이어 붙여 index.html 하나로 만듭니다.
// (index.html 을 더블클릭으로 열어도 동작하도록 스크립트를 인라인으로 넣어요)
// 사용법: node build.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = new URL('./src/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
const code = files.map((f) => `// ---------- ${f} ----------\n${readFileSync(new URL(f, dir), 'utf8')}`).join('\n');
// 아이콘(favicon.svg)도 안에 넣어서 index.html 파일 하나만 열어도 보이게 해요
const icon = 'data:image/svg+xml,' + encodeURIComponent(readFileSync(new URL('./favicon.svg', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim());
const html = readFileSync(new URL('template.html', dir), 'utf8')
  .replace('href="favicon.svg"', () => `href="${icon}"`)
  .replace('/*__GAME_SRC__*/', () => code);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(`index.html 생성 완료 (${files.length}개 파일)`);
