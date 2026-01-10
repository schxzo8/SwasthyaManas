import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">

      {/* HERO SECTION */}
<section className="hero">

  {/* TOP HERO ROW */}
  <div className="hero-row">

    {/* LEFT TEXT */}
    <div className="hero-text">
      <h1 className="hero-title">
        Your compassionate companion on the <br />
        journey to mental wellness.
      </h1>

      <p className="hero-subtitle">
        Start nurturing your mind and well-being today.
        SwasthyaManas is here to guide you every step of the way.
      </p>

      <button className="hero-btn">Learn more</button>
    </div>

    {/* RIGHT IMAGE */}
    <div className="hero-image">
      <img
        src="/assets/therapy.jpg"
        alt="Mental health support"
      />
    </div>

  </div>

  {/* GOAL SECTION */}
  <div className="hero-goal">
    <h3>Our Goal</h3>
    <p>
      Supporting your journey with guidance and skills
      to nurture a healthier, more balanced mind.
    </p>
  </div>

</section>


      {/* LEARN & EXPLORE */}
      <section className="learn">
        <h2>Learn & Explore</h2>

        <div className="learn-card">
          <h3>About SwasthyaManas</h3>
          <p>SwasthyaManas is a mental health support platform.</p>
          <span className="category">about</span>
        </div>
      </section>

    </div>
  );
}

export default Home;
