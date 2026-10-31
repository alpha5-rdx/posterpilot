import { LogoMark } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="brand__mark">
            <LogoMark />
          </span>
          PosterPilot
        </div>
        <p>
          Images are delivered on the fly by Cloudinary. Original uploads happen once —
          every format is a transformation of the same asset.
        </p>
      </div>
    </footer>
  );
}
