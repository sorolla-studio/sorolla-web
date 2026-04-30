"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";

const SECTIONS = [
  { id: "hero", label: "Index", theme: "dark" as const },
  { id: "mission", label: "Mission", theme: "light" as const },
  { id: "process", label: "Process", theme: "dark" as const },
  { id: "team", label: "Team", theme: "light" as const },
  { id: "contact", label: "Contact", theme: "light" as const },
];

const REASON_PLACEHOLDERS: Record<string, string> = {
  general: "Tell us what you have in mind.",
  studio:
    "Tell us about your prototype: genre, build status, anything you've tested so far.",
  press: "What are you working on, and what do you need from us?",
  careers: "A short intro plus links to work you're proud of.",
};

export default function Home() {
  const [activeId, setActiveId] = useState("hero");
  const [activeTheme, setActiveTheme] = useState<"dark" | "light">("dark");
  const [reason, setReason] = useState("general");
  const [submitted, setSubmitted] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const processRef = useRef<HTMLElement | null>(null);
  const processTrackRef = useRef<HTMLDivElement | null>(null);
  const processBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => {
      // Hero parallax + fade
      const hero = heroRef.current;
      if (hero && !reduceMotion) {
        const rect = hero.getBoundingClientRect();
        const h = hero.offsetHeight;
        const p = Math.max(0, Math.min(1, -rect.top / h));
        if (heroMediaRef.current) {
          const scale = 1 + p * 0.08;
          const ty = p * 80;
          heroMediaRef.current.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;
        }
        if (heroContentRef.current) {
          const ty = p * -60;
          const op = 1 - p * 1.4;
          heroContentRef.current.style.transform = `translate3d(0, ${ty}px, 0)`;
          heroContentRef.current.style.opacity = String(Math.max(0, op));
        }
      }

      // Process horizontal scroll inside pinned vertical scroll
      const wrap = processRef.current;
      const track = processTrackRef.current;
      if (wrap && track && !reduceMotion) {
        const rect = wrap.getBoundingClientRect();
        const wrapH = wrap.offsetHeight;
        const vh = window.innerHeight;
        const total = wrapH - vh;
        const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
        const trackW = track.scrollWidth;
        const stageW = wrap.offsetWidth;
        const distance = Math.max(0, trackW - stageW + 96);
        track.style.transform = `translate3d(${-distance * p}px, 0, 0)`;
        if (processBarRef.current) {
          processBarRef.current.style.width = `${(p * 100).toFixed(2)}%`;
        }
      }

      // Mission/team parallax (data-parallax)
      if (!reduceMotion) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight;
          const center = rect.top + rect.height / 2;
          const pp = (center - vh / 2) / vh;
          const speed = parseFloat(el.dataset.parallax || "0.15");
          el.style.transform = `translate3d(0, ${(-pp * 80 * speed).toFixed(2)}px, 0)`;
        });
      }

      // Section tracking — most-visible wins
      const vh = window.innerHeight;
      let best: { id: string; score: number; theme: "dark" | "light" } = {
        id: "hero",
        score: -Infinity,
        theme: "dark",
      };
      document.querySelectorAll<HTMLElement>("[data-section]").forEach((s) => {
        const r = s.getBoundingClientRect();
        const top = Math.max(0, r.top);
        const bottom = Math.min(vh, r.bottom);
        const visible = Math.max(0, bottom - top);
        if (visible > best.score) {
          best = {
            id: s.dataset.section || "hero",
            score: visible,
            theme: s.dataset.theme === "dark" ? "dark" : "light",
          };
        }
      });
      setActiveId(best.id);
      setActiveTheme(best.theme);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.querySelector(`[data-section="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const required = ["name", "email", "message"];
    const missing = required.find((k) => !String(data.get(k) || "").trim());
    if (missing) {
      setInvalidField(missing);
      const el = form.elements.namedItem(missing) as HTMLElement | null;
      el?.focus();
      return;
    }
    setInvalidField(null);

    try {
      const body = new URLSearchParams();
      data.forEach((v, k) => body.append(k, String(v)));
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="cinematic">
      {/* Side-dots nav */}
      <div className={`nav-dots ${activeTheme === "light" ? "on-light" : ""}`}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            aria-current={s.id === activeId}
            aria-label={s.label}
            onClick={() => scrollTo(s.id)}
          >
            <span className="dot" />
            <span className="dot-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* HERO */}
      <section
        ref={heroRef}
        className="hero"
        data-section="hero"
        data-theme="dark"
      >
        <div ref={heroMediaRef} className="hero-media">
          <Image
            src="/images/hero-image.png"
            alt="A group of happy teenagers and young adults in a gaming arcade, playing games on their smartphones, smiling, laughing, and enjoying their time together."
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="hero-overlay" />
        <div ref={heroContentRef} className="hero-content">
          <div className="hero-eyebrow">Hybrid casual · est. 2024</div>
          <h1 className="hero-title">
            Sorolla <em>|</em> Just Play
          </h1>
        </div>
        <div className="hero-scroll-cue">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* MISSION */}
      <section className="scene mission" data-section="mission" data-theme="light">
        <div className="pin-wrap short">
          <div className="pin-stage">
            <div className="mission-inner">
              <div>
                <div className="eyebrow">Mission</div>
                <h2 className="section-title">
                  We make hybrid&nbsp;casual games
                  <br />
                  <em>worth playing</em>.
                </h2>
                <p className="section-lede">
                  Sorolla is a small team turning promising prototypes into globally
                  published mobile games. We work behind the scenes — quietly,
                  deliberately, and with a healthy distrust of our own taste.
                </p>
              </div>
              <div className="mission-visual" data-parallax="0.4">
                <div className="placeholder" />
                <div className="ph-label">[ studio photograph ]</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section
        ref={processRef}
        className="scene process"
        data-section="process"
        data-theme="dark"
      >
        <div className="pin-wrap">
          <div className="pin-stage process-stage">
            <div className="process-header">
              <div className="eyebrow">How we work</div>
              <h2 className="section-title">
                A quiet, <em>data-driven</em> loop.
              </h2>
            </div>

            <div ref={processTrackRef} className="process-track">
              <article className="process-step">
                <div className="num">01 — Read</div>
                <h3>
                  Read the <em>market</em>, not the room.
                </h3>
                <p>
                  Hybrid casual rewards instincts most people don&apos;t have. We
                  start from market behavior — rankings, retention curves, creative
                  signals — not from what feels good in a meeting.
                </p>
              </article>

              <article className="process-step">
                <div className="num">02 — Test</div>
                <h3>
                  Real spend, <em>real users</em>.
                </h3>
                <p>
                  Prototypes go through structured UA tests with measurable budgets.
                  CPI, D1, D7, session length, early monetization — the same numbers
                  everyone uses, reported transparently to the studios we work with.
                </p>
              </article>

              <article className="process-step">
                <div className="num">03 — Decide</div>
                <h3>
                  Honest <em>thresholds</em>.
                </h3>
                <p>
                  We share the numbers as they come in. If a prototype clears, we
                  scale together. If not, we say so quickly and move on. No opaque
                  feedback, no slow no&apos;s.
                </p>
              </article>

              <article className="process-step">
                <div className="num">04 — Scale</div>
                <h3>
                  Through to <em>live ops</em>.
                </h3>
                <p>
                  For winners: SDK integration, creative production, paid UA,
                  monetization tuning, live ops. We treat scaling as part of the
                  product, not an afterthought.
                </p>
              </article>
            </div>

            <div className="process-progress">
              <div ref={processBarRef} className="process-progress-bar" />
            </div>
            <div className="process-progress-labels">
              <span>Read</span>
              <span>Test</span>
              <span>Decide</span>
              <span>Scale</span>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="scene team" data-section="team" data-theme="light">
        <div className="pin-wrap short">
          <div className="pin-stage">
            <div className="team-inner">
              <div className="team-header">
                <div className="eyebrow">Team</div>
                <h2 className="section-title">
                  A few people, working <em>closely</em>.
                </h2>
                <p className="section-lede">
                  Sorolla is intentionally small. Decision-makers are reachable;
                  feedback is direct. We treat the studios we work with the way
                  we&apos;d want to be treated as developers.
                </p>
              </div>

              <div className="team-grid">
                <div className="team-card">
                  <div className="team-portrait" data-parallax="0.15">
                    <div className="placeholder" />
                    <div className="initials">A</div>
                    <div className="ph-label">[ portrait ]</div>
                  </div>
                  <h3 className="team-name">Founder</h3>
                  <p className="team-role">CEO</p>
                  <p className="team-bio">
                    Background in mobile publishing and product. Leads partnerships,
                    fundraising, and the overall direction of the studio.
                  </p>
                </div>

                <div className="team-card">
                  <div className="team-portrait" data-parallax="0.2">
                    <div className="placeholder" />
                    <div className="initials">B</div>
                    <div className="ph-label">[ portrait ]</div>
                  </div>
                  <h3 className="team-name">Co-founder</h3>
                  <p className="team-role">Product &amp; Tech</p>
                  <p className="team-bio">
                    Shapes the publishing platform and the SDK. Lives between the
                    analytics pipeline and the studios shipping into it.
                  </p>
                </div>

                <div className="team-card">
                  <div className="team-portrait" data-parallax="0.1">
                    <div className="placeholder" />
                    <div className="initials">C</div>
                    <div className="ph-label">[ portrait ]</div>
                  </div>
                  <h3 className="team-name">Co-founder</h3>
                  <p className="team-role">UA &amp; Creative</p>
                  <p className="team-bio">
                    Runs the testing loop end-to-end: media buying, creative
                    production, and the read on whether a prototype can scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" data-section="contact" data-theme="light">
        <div className="contact-inner">
          <div className="contact-headline">
            <div className="eyebrow">Contact</div>
            <h2 className="section-title">
              Tell us what you&apos;re <em>working on</em>.
            </h2>
            <p className="section-lede">
              A real human reads every message. We try to reply within a week, even
              if the answer is no.
            </p>
          </div>

          {submitted ? (
            <div className="form-success" role="status">
              <strong>Thanks — we&apos;ll be in touch.</strong>
              <div className="sub">A real human reads every message.</div>
            </div>
          ) : (
            <form
              className="form"
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              noValidate
            >
              <input type="hidden" name="form-name" value="contact" />
              <p hidden>
                <label>
                  Don&apos;t fill this out: <input name="bot-field" />
                </label>
              </p>

              <div className="form-content">
                <div className="field">
                  <label htmlFor="reason">Reason for contact</label>
                  <select
                    id="reason"
                    name="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="general">General</option>
                    <option value="studio">Studio — submit a prototype</option>
                    <option value="press">Press</option>
                    <option value="careers">Careers</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={invalidField === "name" ? "invalid" : undefined}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={invalidField === "email" ? "invalid" : undefined}
                  />
                </div>

                <div className="field">
                  <label htmlFor="company">
                    Studio / company <span className="optional">(optional)</span>
                  </label>
                  <input id="company" name="company" type="text" />
                </div>

                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder={REASON_PLACEHOLDERS[reason] || ""}
                    className={invalidField === "message" ? "invalid" : undefined}
                  />
                </div>

                <button type="submit" className="btn">
                  Send message
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div>© Sorolla, 2026</div>
        <div className="footer-links">
          <a href="mailto:contact@sorolla.io">contact@sorolla.io</a>
          <a href="/privacy-policy">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
