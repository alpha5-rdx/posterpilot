import { describe, it, expect } from 'vitest';
import {
  buildTransformation,
  insertTransformation,
  buildFormatUrl,
  buildDownloadUrl,
  OUTPUT_FORMATS,
  ADAPTATION_MODES,
} from './cloudinary.js';

const SAMPLE_URL =
  'https://res.cloudinary.com/demo/image/upload/v1700000000/posterpilot/event_poster.png';

describe('buildTransformation', () => {
  it('builds a padded (no-crop) transformation with white background', () => {
    const t = buildTransformation(ADAPTATION_MODES.NO_CROP, 1080, 1080);
    expect(t).toBe('c_pad,b_white,w_1080,h_1080,q_auto,f_auto');
  });

  it('builds a crop-to-fill transformation centered', () => {
    const t = buildTransformation(ADAPTATION_MODES.CROP_TO_FILL, 1080, 1920);
    expect(t).toBe('c_fill,g_center,w_1080,h_1920,q_auto,f_auto');
  });

  it('defaults unknown modes to no-crop padding', () => {
    const t = buildTransformation('something-else', 1200, 630);
    expect(t).toMatch(/^c_pad,b_white,w_1200,h_630/);
  });

  it('throws on invalid dimensions', () => {
    expect(() => buildTransformation(ADAPTATION_MODES.NO_CROP, 0, 100)).toThrow();
    expect(() => buildTransformation(ADAPTATION_MODES.NO_CROP, -1, 100)).toThrow();
    expect(() => buildTransformation(ADAPTATION_MODES.NO_CROP, NaN, 100)).toThrow();
  });
});

describe('insertTransformation', () => {
  it('inserts the transformation right after /upload/ and preserves version + public id', () => {
    const url = insertTransformation(SAMPLE_URL, 'c_pad,w_1080,h_1080');
    expect(url).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_pad,w_1080,h_1080/v1700000000/posterpilot/event_poster.png'
    );
  });

  it('returns the original URL when no transformation is supplied', () => {
    expect(insertTransformation(SAMPLE_URL, '')).toBe(SAMPLE_URL);
  });

  it('throws on a non-Cloudinary URL', () => {
    expect(() => insertTransformation('https://example.com/image.png', 'c_fill')).toThrow();
    expect(() => insertTransformation('', 'c_fill')).toThrow();
    expect(() => insertTransformation(null, 'c_fill')).toThrow();
  });

  it('works even when the version segment is absent', () => {
    const noVersion = 'https://res.cloudinary.com/demo/image/upload/posterpilot/x.png';
    const url = insertTransformation(noVersion, 'c_fill,w_100,h_100');
    expect(url).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_100,h_100/posterpilot/x.png'
    );
  });
});

describe('buildFormatUrl', () => {
  it('builds a full delivery URL for each output format', () => {
    OUTPUT_FORMATS.forEach((format) => {
      const url = buildFormatUrl(SAMPLE_URL, ADAPTATION_MODES.NO_CROP, format);
      expect(url).toContain(`w_${format.width}`);
      expect(url).toContain(`h_${format.height}`);
      expect(url).toContain('/v1700000000/posterpilot/event_poster.png');
      expect(url).toContain('c_pad');
    });
  });
});

describe('buildDownloadUrl', () => {
  it('adds an fl_attachment flag with a sanitized filename', () => {
    const format = OUTPUT_FORMATS[0];
    const url = buildDownloadUrl(SAMPLE_URL, ADAPTATION_MODES.CROP_TO_FILL, format, 'My Poster!!');
    expect(url).toContain('fl_attachment:My-Poster');
    expect(url).toContain('c_fill');
    expect(url).toContain(`w_${format.width}`);
  });

  it('falls back to a default name when none is usable', () => {
    const format = OUTPUT_FORMATS[0];
    const url = buildDownloadUrl(SAMPLE_URL, ADAPTATION_MODES.NO_CROP, format, '!!!');
    expect(url).toContain(`fl_attachment:posterpilot-${format.id}`);
  });

  it('defaults to jpg: pins f_jpg and rewrites the file extension', () => {
    const format = OUTPUT_FORMATS[0];
    const url = buildDownloadUrl(SAMPLE_URL, ADAPTATION_MODES.NO_CROP, format, 'poster');
    expect(url).toContain('f_jpg');
    expect(url).not.toContain('f_auto');
    expect(url.endsWith('.jpg')).toBe(true);
  });

  it('produces a png download when requested', () => {
    const format = OUTPUT_FORMATS[0];
    const url = buildDownloadUrl(SAMPLE_URL, ADAPTATION_MODES.NO_CROP, format, 'poster', 'png');
    expect(url).toContain('f_png');
    expect(url.endsWith('.png')).toBe(true);
  });

  it('never emits JXL/AVIF/WebP for an unknown format (falls back to jpg)', () => {
    const format = OUTPUT_FORMATS[0];
    const url = buildDownloadUrl(SAMPLE_URL, ADAPTATION_MODES.NO_CROP, format, 'poster', 'jxl');
    expect(url).toContain('f_jpg');
    expect(url.endsWith('.jpg')).toBe(true);
  });
});

describe('buildTransformation format option', () => {
  it('uses f_auto by default (for on-screen previews)', () => {
    expect(buildTransformation(ADAPTATION_MODES.NO_CROP, 1080, 1080)).toContain('f_auto');
  });

  it('pins an explicit delivery format when provided', () => {
    const t = buildTransformation(ADAPTATION_MODES.CROP_TO_FILL, 1080, 1080, { format: 'png' });
    expect(t).toContain('f_png');
    expect(t).not.toContain('f_auto');
  });
});

describe('OUTPUT_FORMATS', () => {
  it('defines the five required presets with correct dimensions', () => {
    expect(OUTPUT_FORMATS).toHaveLength(5);
    const byId = Object.fromEntries(
      OUTPUT_FORMATS.map((f) => [f.id, `${f.width}x${f.height}`])
    );
    expect(byId['instagram-square']).toBe('1080x1080');
    expect(byId['instagram-story']).toBe('1080x1920');
    expect(byId['web-preview']).toBe('1200x630');
    expect(byId['linkedin-portrait']).toBe('1080x1350');
    expect(byId['linkedin-square']).toBe('1080x1080');
  });

  it('has unique ids', () => {
    const ids = OUTPUT_FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
