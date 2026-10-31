const STEPS = [
  {
    title: 'Upload once',
    desc: 'Your poster is uploaded to Cloudinary a single time using a secure unsigned preset.',
  },
  {
    title: 'No-Crop padding',
    desc: 'No-Crop resizes your poster to fit each frame and fills the leftover space with a white background, so the full design stays visible. It adds padding — it does not read or detect text.',
  },
  {
    title: 'Deliver anywhere',
    desc: 'Each format is a live Cloudinary delivery URL with q_auto and f_auto optimization. Copy a link or download the file.',
  },
];

export default function HowItWorks() {
  return (
    <div className="panel panel--pad">
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <h2>How No-Crop works</h2>
          <p>Honest, predictable transformations — no guesswork about your artwork.</p>
        </div>
      </div>
      <div className="howto">
        {STEPS.map((step, index) => (
          <div className="howto-item" key={step.title}>
            <span className="howto-item__num">{index + 1}</span>
            <span className="howto-item__title">{step.title}</span>
            <span className="howto-item__desc">{step.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
