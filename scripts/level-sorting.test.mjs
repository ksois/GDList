import test from 'node:test'
import assert from 'node:assert/strict'
import { sortLevels } from '../src/utils/levelSorting.js'
import { TRANSLATIONS } from '../src/i18n/translations.js'

const levels = [
  { id: 'hard', position: 1, points: 500, victoryCount: 2 },
  { id: 'middle', position: 12, points: 350, victoryCount: 9 },
  { id: 'easy', position: 50, points: 125, victoryCount: 4 },
]

test('level sorting keeps input immutable and applies all requested orders', () => {
  assert.deepEqual(sortLevels(levels, 'hardest').map(level => level.id), ['hard', 'middle', 'easy'])
  assert.deepEqual(sortLevels(levels, 'easiest').map(level => level.id), ['easy', 'middle', 'hard'])
  assert.deepEqual(sortLevels(levels, 'beaten').map(level => level.id), ['middle', 'easy', 'hard'])
  assert.deepEqual(levels.map(level => level.id), ['hard', 'middle', 'easy'])
})

test('level sort copy is available in English and Russian', () => {
  for (const key of ['sortBy', 'sortHardest', 'sortEasiest', 'sortBeaten']) {
    assert.ok(TRANSLATIONS.en.list[key])
    assert.ok(TRANSLATIONS.ru.list[key])
  }
})
