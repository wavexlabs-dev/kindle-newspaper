import test from 'node:test';
import assert from 'node:assert/strict';
import { safeGenerationError } from '../src/publish.js';
test('generation audit only exposes known errors and strips private upstream messages', () => {
  assert.equal(safeGenerationError(new Error('Research did not complete')), 'Research did not complete');
  const error = new Error('private newsletter content and token'); error.status = 403;
  assert.deepEqual(safeGenerationError(error), { type: 'Error', status: 403 });
  error.name = 'ZodError';
  assert.equal(safeGenerationError(error), 'Editorial schema validation failed');
});

test('editorial API schema avoids unsupported uri format while local validation rejects malformed URLs', async () => {
  const { zodTextFormat } = await import('openai/helpers/zod');
  const { EditorialResponse, Article } = await import('../src/edition.js');
  const schema = zodTextFormat(EditorialResponse, 'editorial').schema;
  assert.equal(JSON.stringify(schema).includes('"format":"uri"'), false);
  assert.equal(Article.shape.sources.safeParse(['https://']).success, false);
});
