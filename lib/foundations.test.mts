import { test } from 'node:test';
import { colorTokens, easings, motionTokens, radiusScale, shadowTokens, tokenOverview, typeRoles } from './foundations.ts';

test('every token in tokens.css has Foundations copy', () => {
  colorTokens();
  typeRoles();
  shadowTokens();
  radiusScale();
  easings();
  motionTokens();
  tokenOverview();
});
