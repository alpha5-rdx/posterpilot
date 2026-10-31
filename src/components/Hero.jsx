export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <span className="hero__eyebrow">For societies, clubs &amp; event organizers</span>

        <h1 className="hero__title">
          One poster, <span className="grad">every platform</span> — ready in seconds
        </h1>

        {/* The brand tagline, presented as the prominent centerpiece.
            Each phrase carries its own accent so the three ideas read as a trio. */}
        <p className="tagline" aria-label="One Poster. Multiple Platforms. No Unnecessary Cropping.">
          <span className="tagline__part tagline__part--one">
            <span className="tagline__dot" aria-hidden="true" />
            One&nbsp;Poster.
          </span>
          <span className="tagline__sep" aria-hidden="true" />
          <span className="tagline__part tagline__part--two">
            <span className="tagline__dot" aria-hidden="true" />
            Multiple&nbsp;Platforms.
          </span>
          <span className="tagline__sep" aria-hidden="true" />
          <span className="tagline__part tagline__part--three">
            <span className="tagline__dot" aria-hidden="true" />
            No&nbsp;Unnecessary&nbsp;Cropping.
          </span>
        </p>

        <p className="hero__subtitle">
          Upload your event poster once and PosterPilot adapts it into Instagram Square,
          Instagram Story, web preview, and LinkedIn formats. Keep the whole design
          visible with No-Crop padding, or fill the frame edge to edge.
        </p>
      </div>
    </section>
  );
}
