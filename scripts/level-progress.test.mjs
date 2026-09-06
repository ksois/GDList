import test from 'node:test'
import assert from 'node:assert/strict'
import { bestProgress, progressPrefix, readRuns, saveRun, validRange } from '../src/utils/levelProgress.js'
import { TRANSLATIONS } from '../src/i18n/translations.js'

function storage() {
  const data = new Map()
  return { get length() { return data.size }, key: i => [...data.keys()][i], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
}
test('whole percentage validation and boundaries', () => {
  for (const [start, end] of [[0,75],[42,100],[0,100],[99,100]]) assert.ok(validRange(start,end))
  for (const [start,end] of [[0,0],[75,42],[-1,100],[0,101],[0,75.5],[NaN,100]]) assert.equal(validRange(start,end),false)
})
test('runs persist separately by account and level; practice does not inflate best', () => {
  const db=storage(), key=progressPrefix('one','level')
  saveRun(db,key,{id:'a',start:0,end:75,createdAt:1})
  saveRun(db,key,{id:'b',start:42,end:100,createdAt:2})
  assert.equal(bestProgress(readRuns(db,key)),75)
  assert.deepEqual(readRuns(db,key).map(run=>run.id),['b','a'])
  assert.equal(readRuns(db,progressPrefix('two','level')).length,0)
  assert.equal(readRuns(db,progressPrefix('one','another')).length,0)
  assert.equal(readRuns(db,progressPrefix(null,'level')).length,0)
  db.removeItem(key+'a')
  assert.equal(bestProgress(readRuns(db,key)),0)
  assert.equal(readRuns(db,key).length,1)
})
test('storage errors surface and corrupt history is not replaced', () => {
  const db=storage(), key=progressPrefix('one','level')
  db.setItem(key+'bad','not json')
  assert.throws(()=>readRuns(db,key))
  assert.equal(db.getItem(key+'bad'),'not json')
  assert.throws(()=>saveRun({setItem(){throw new Error('quota')}},key,{id:'a',start:0,end:75,createdAt:1}),/quota/)
})
test('progress copy has English and Russian key parity', () => {
  assert.deepEqual(Object.keys(TRANSLATIONS.en.progress).sort(),Object.keys(TRANSLATIONS.ru.progress).sort())
})
