import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  formatFileSize,
  getExtension,
  MAX_FILE_SIZE_BYTES,
} from './validation.js';

// Minimal File-like stub (jsdom File works, but this keeps tests explicit).
function fakeFile({ name = 'poster.png', type = 'image/png', size = 1024 } = {}) {
  return { name, type, size };
}

describe('getExtension', () => {
  it('extracts a lowercase extension', () => {
    expect(getExtension('Poster.PNG')).toBe('png');
    expect(getExtension('a.b.jpeg')).toBe('jpeg');
  });

  it('returns empty string when there is no extension', () => {
    expect(getExtension('poster')).toBe('');
    expect(getExtension('poster.')).toBe('');
    expect(getExtension('')).toBe('');
    expect(getExtension(null)).toBe('');
  });
});

describe('formatFileSize', () => {
  it('formats bytes into readable units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('handles invalid input', () => {
    expect(formatFileSize(null)).toBe('—');
    expect(formatFileSize(-5)).toBe('—');
    expect(formatFileSize(NaN)).toBe('—');
  });
});

describe('validateImageFile', () => {
  it('accepts allowed image types', () => {
    expect(validateImageFile(fakeFile({ type: 'image/jpeg', name: 'x.jpg' })).valid).toBe(true);
    expect(validateImageFile(fakeFile({ type: 'image/png', name: 'x.png' })).valid).toBe(true);
    expect(validateImageFile(fakeFile({ type: 'image/webp', name: 'x.webp' })).valid).toBe(true);
  });

  it('accepts by extension when MIME type is missing', () => {
    const result = validateImageFile(fakeFile({ type: '', name: 'poster.jpeg' }));
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported types', () => {
    const result = validateImageFile(fakeFile({ type: 'image/gif', name: 'x.gif' }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/unsupported/i);
  });

  it('rejects files over the 10 MB limit', () => {
    const result = validateImageFile(
      fakeFile({ type: 'image/png', name: 'big.png', size: MAX_FILE_SIZE_BYTES + 1 })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it('accepts a file exactly at the limit', () => {
    const result = validateImageFile(
      fakeFile({ type: 'image/png', name: 'edge.png', size: MAX_FILE_SIZE_BYTES })
    );
    expect(result.valid).toBe(true);
  });

  it('rejects when no file is given', () => {
    expect(validateImageFile(null).valid).toBe(false);
  });
});
