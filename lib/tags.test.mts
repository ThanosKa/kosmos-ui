// Usage: node --test lib/tags.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addTags, isEmail, splitTags, takeTags } from '../registry/kosmos/lib/tags.ts';

test('a pasted list splits on each delimiter and on line breaks, trimmed, with empty pieces dropped', () => {
  assert.deepEqual(splitTags('ana@acme.com, ben@acme.com;\n chloé@acme.fr ,, ', [',', ';']), [
    'ana@acme.com',
    'ben@acme.com',
    'chloé@acme.fr',
  ]);
});

test('typing a delimiter completes the tags before it and keeps the rest as the draft', () => {
  assert.deepEqual(takeTags('ana@acme.com, ben@ac', [',']), { complete: ['ana@acme.com'], rest: 'ben@ac' });
  assert.deepEqual(takeTags('ana@acme.com,', [',']), { complete: ['ana@acme.com'], rest: '' });
});

test('a draft with no delimiter stays a draft, untouched', () => {
  assert.deepEqual(takeTags(' ana@ac', [',']), { complete: [], rest: ' ana@ac' });
});

test('adding keeps the order typed and skips a tag already in the list, whatever its case', () => {
  assert.deepEqual(addTags(['ana@acme.com'], ['ben@acme.com', 'ANA@acme.com', 'ben@acme.com']), {
    tags: ['ana@acme.com', 'ben@acme.com'],
    added: ['ben@acme.com'],
    duplicates: ['ANA@acme.com', 'ben@acme.com'],
    overLimit: [],
  });
});

test('duplicates can be allowed', () => {
  assert.deepEqual(addTags(['bug'], ['bug'], { allowDuplicates: true }).tags, ['bug', 'bug']);
});

test('tags past the limit are left out and reported', () => {
  assert.deepEqual(addTags(['a', 'b'], ['c', 'd', 'e'], { max: 3 }), {
    tags: ['a', 'b', 'c'],
    added: ['c'],
    duplicates: [],
    overLimit: ['d', 'e'],
  });
});

test('an email needs one @ with a name before it and a domain with a dot after it', () => {
  for (const valid of ['ana@acme.com', 'chloé.martin+ops@acme.co.uk', 'a@b.io']) assert.equal(isEmail(valid), true, valid);
  for (const invalid of ['ana', 'ana@', '@acme.com', 'ana@acme', 'ana@@acme.com', 'ana @acme.com', 'ana@acme.com.']) {
    assert.equal(isEmail(invalid), false, invalid);
  }
});

test('a space can be a delimiter, so a space typed after an address completes it', () => {
  assert.deepEqual(takeTags('ana@acme.com ', [' ']), { complete: ['ana@acme.com'], rest: '' });
});
