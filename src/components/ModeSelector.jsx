import { ADAPTATION_MODES } from '../lib/cloudinary.js';

const MODES = [
  {
    id: ADAPTATION_MODES.NO_CROP,
    name: 'No-Crop',
    badge: 'Default',
    desc: 'Keeps your entire poster visible by adding white padding where the aspect ratio differs. Nothing is cut off.',
  },
  {
    id: ADAPTATION_MODES.CROP_TO_FILL,
    name: 'Crop-to-Fill',
    badge: 'Fills frame',
    desc: 'Fills the whole frame from the center. Edges of the poster may be cropped to match the target size.',
  },
];

/**
 * @param {{ mode: string, onChange: (mode: string) => void }} props
 */
export default function ModeSelector({ mode, onChange }) {
  return (
    <div
      className="modes"
      role="radiogroup"
      aria-label="Image adaptation mode"
    >
      {MODES.map((item) => {
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`mode-card ${active ? 'mode-card--active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <div className="mode-card__head">
              <span className="mode-card__name">{item.name}</span>
              <span className="mode-card__radio" aria-hidden="true" />
            </div>
            <span className="mode-card__badge">{item.badge}</span>
            <span className="mode-card__desc">{item.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
