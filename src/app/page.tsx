"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { homeContent, type EmphasizedText } from "@/content/home";
import { siteContent } from "@/content/site";

function EmText({ text }: { text: EmphasizedText }) {
  return (
    <>
      {text.before}
      <em>{text.emphasized}</em>
      {text.after}
    </>
  );
}

const REASON_PLACEHOLDERS = Object.fromEntries(
  homeContent.contact.reasons.map((reason) => [reason.value, reason.placeholder]),
);

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
    const required = [...homeContent.contact.requiredFields];
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
        {homeContent.sections.map((s) => (
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
            src={homeContent.hero.image.src}
            alt={homeContent.hero.image.alt}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="hero-overlay" />
        <div ref={heroContentRef} className="hero-content">
          <div className="hero-eyebrow">{homeContent.hero.eyebrow}</div>
          <h1 className="hero-title">
            <EmText text={homeContent.hero.title} />
          </h1>
        </div>
        <div className="hero-scroll-cue">
          <span>{homeContent.hero.scrollCue}</span>
          <span className="line" />
        </div>
      </section>

      {/* MISSION */}
      <section className="scene mission" data-section="mission" data-theme="light">
        <div className="pin-wrap short">
          <div className="pin-stage">
            <div className="mission-inner">
              <div>
                <div className="eyebrow">{homeContent.mission.eyebrow}</div>
                <h2 className="section-title">
                  {homeContent.mission.title.before}
                  <br />
                  <em>{homeContent.mission.title.emphasized}</em>
                  {homeContent.mission.title.after}
                </h2>
                <p className="section-lede">{homeContent.mission.body}</p>
              </div>
              <div className="mission-visual" data-parallax="0.4">
                <div className="placeholder" />
                <div className="ph-label">{homeContent.mission.visualLabel}</div>
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
              <div className="eyebrow">{homeContent.process.eyebrow}</div>
              <h2 className="section-title">
                <EmText text={homeContent.process.title} />
              </h2>
            </div>

            <div ref={processTrackRef} className="process-track">
              {homeContent.process.steps.map((step) => (
                <article key={step.number} className="process-step">
                  <div className="num">
                    {step.number} — {step.label}
                  </div>
                  <h3>
                    <EmText text={step.title} />
                  </h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>

            <div className="process-progress">
              <div ref={processBarRef} className="process-progress-bar" />
            </div>
            <div className="process-progress-labels">
              {homeContent.process.steps.map((step) => (
                <span key={step.label}>{step.label}</span>
              ))}
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
                <div className="eyebrow">{homeContent.team.eyebrow}</div>
                <h2 className="section-title">
                  <EmText text={homeContent.team.title} />
                </h2>
                <p className="section-lede">{homeContent.team.body}</p>
              </div>

              <div className="team-grid">
                {homeContent.team.members.map((member) => (
                  <div key={`${member.name}-${member.role}`} className="team-card">
                    <div className="team-portrait" data-parallax={member.parallax}>
                      <div className="placeholder" />
                      <div className="initials">{member.initials}</div>
                      <div className="ph-label">{member.portraitLabel}</div>
                    </div>
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-bio">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" data-section="contact" data-theme="light">
        <div className="contact-inner">
          <div className="contact-headline">
            <div className="eyebrow">{homeContent.contact.eyebrow}</div>
            <h2 className="section-title">
              <EmText text={homeContent.contact.title} />
            </h2>
            <p className="section-lede">{homeContent.contact.body}</p>
          </div>

          {submitted ? (
            <div className="form-success" role="status">
              <strong>{homeContent.contact.successTitle}</strong>
              <div className="sub">{homeContent.contact.successSubtitle}</div>
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
                  {homeContent.contact.fields.honeypot} <input name="bot-field" />
                </label>
              </p>

              <div className="form-content">
                <div className="field">
                  <label htmlFor="reason">{homeContent.contact.fields.reason}</label>
                  <select
                    id="reason"
                    name="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    {homeContent.contact.reasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="name">{homeContent.contact.fields.name}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={invalidField === "name" ? "invalid" : undefined}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">{homeContent.contact.fields.email}</label>
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
                    {homeContent.contact.fields.company}{" "}
                    <span className="optional">{homeContent.contact.fields.optional}</span>
                  </label>
                  <input id="company" name="company" type="text" />
                </div>

                <div className="field">
                  <label htmlFor="message">{homeContent.contact.fields.message}</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder={REASON_PLACEHOLDERS[reason] || ""}
                    className={invalidField === "message" ? "invalid" : undefined}
                  />
                </div>

                <button type="submit" className="btn">
                  {homeContent.contact.submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div>© {siteContent.companyName}, {siteContent.copyrightYear}</div>
        <div className="footer-links">
          <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a>
          <Link href="/privacy-policy">{siteContent.footer.privacyLabel}</Link>
        </div>
      </footer>
    </div>
  );
}
