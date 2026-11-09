import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,words,alphabet,award} from '../src/data.js';
test('curriculum questions have valid unique choices',()=>{assert.equal(alphabet.length,28);assert.equal(new Set(words.map(w=>w.id)).size,words.length);for(const l of lessons){assert.equal(l.questions.length,4);for(const [question,options,answer] of l.questions){assert.ok(question);assert.equal(new Set(options).size,4);assert.ok(options[answer]);}}});
test('repeat lessons do not farm XP; best score and unique days persist',()=>{const s={completed:[],xp:0,best:{},days:[]};let a=award(s,0,3,4,'2026-11-10');assert.equal(a.xp,30);a=award(a,0,4,4,'2026-11-10');assert.equal(a.xp,30);assert.equal(a.best[0],4);assert.deepEqual(a.completed,[0]);assert.equal(a.days.length,1);a=award(a,1,4,4,'2026-11-11');assert.equal(a.xp,70);assert.equal(a.days.length,2);assert.deepEqual(s.completed,[]);});
