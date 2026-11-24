import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const file=p=>readFileSync(resolve(root,p),'utf8');
const html=file('index.html'),app=file('src/app.ts'),graph=file('src/graph.ts');
test('all five chapters have direct anchor navigation',()=>{
  for(const id of ['hold','recognise','intervene','support','next']){
    assert.match(html,new RegExp(`id="${id}"`));assert.match(html,new RegExp(`href="#${id}"`))
  }
});
test('eSafety data is transcribed exactly in visible table',()=>{
  assert.match(html,/<th scope="row">10–12<\/th><td>46%<\/td><td>34%<\/td>/);
  assert.match(html,/<th scope="row">13–15<\/th><td>57%<\/td><td>42%<\/td>/);
  assert.match(html,/<th scope="row">16–17<\/th><td>59%<\/td><td>39%<\/td>/);
  assert.match(html,/<th scope="row">All 10–17<\/th><td>53%<\/td><td>38%<\/td>/);
});
test('reflections are safely rendered and locally controlled',()=>{
  assert.ok(app.includes('p.textContent=note.text'));
  assert.ok(app.includes('localStorage.setItem'));
  assert.ok(app.includes('Clear all my saved notes')||html.includes('Clear all my saved notes'));
  assert.ok(!app.includes('innerHTML'));
});
test('network uses actual WebGL2 vertex and fragment shaders with time and action state',()=>{
  assert.match(graph,/#version 300 es/);
  assert.match(graph,/uTime/);
  assert.match(graph,/uWave/);
  for(const state of ['forward','pause','checkin','adult'])assert.match(graph,new RegExp(state+':\\{'));
});
test('production prerequisites and local generated images are present',()=>{
  for(const p of ['package.json','tsconfig.json','.github/workflows/deploy.yml','public/images/hold-the-moment.webp','public/images/amplification-map.webp','public/images/support-bridge.webp'])assert.ok(existsSync(resolve(root,p)),p)
});
test('audio is user initiated and chapter transcript exists',()=>{
  assert.ok(app.includes('SpeechSynthesisUtterance'));
  assert.ok(app.includes('AudioContext'));
  assert.ok(html.includes('transcript-panel'));
});
