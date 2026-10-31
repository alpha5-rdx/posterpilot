import { LogoMark } from './Icons.jsx';

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <div className="brand">
          <span className="brand__mark">
            <LogoMark />
          </span>
          PosterPilot
        </div>
        <span className="header__tag">
          <span className="header__tag-dot" aria-hidden="true" />
          One Poster. Multiple Platforms. No Unnecessary Cropping.
        </span>
      </div>
    </header>
  );
}
