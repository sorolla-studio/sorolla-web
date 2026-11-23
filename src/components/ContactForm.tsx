"use client";

import { useState, type FormEvent } from "react";
import { homeContent } from "@/content/home";
import { siteContent } from "@/content/site";

const c = homeContent.contact;
const REQUIRED = ["name", "email", "message"] as const;

export default function ContactForm() {
  const [reason, setReason] = useState<string>(c.reasons[0].value);
  const [wrong, setWrong] = useState<{ name: string; say: string } | null>(null);
  const [state, setState] = useState<"open" | "sending" | "sent" | "failed">("open");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, data = new FormData(form);
    const input = (k: string) => form.elements.namedItem(k) as HTMLInputElement;
    const empty = REQUIRED.find((k) => !input(k).value.trim());
    const error = empty ? { name: empty, say: c.missing } : input("email").validity.typeMismatch ? { name: "email", say: c.badEmail } : null;
    setWrong(error);
    if (error) { input(error.name).focus(); return; }
    setState("sending");
    try {
      const body = new URLSearchParams();
      data.forEach((v, k) => body.append(k, String(v)));
      // Netlify reads the fields from public/form.html; with the Next runtime the post has to reach that static file
      const res = await fetch("/form.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      setState(res.ok ? "sent" : "failed");
    } catch { setState("failed"); }
  }

  if (state === "sent") {
    return <div className="form-sent" role="status"><p>{c.sent.title}</p><p>{c.sent.body}</p></div>;
  }

  const field = (name: "name" | "email" | "company", type: string, autoComplete: string, optional = false) => (
    <div className="field">
      <label htmlFor={name}>{c.fields[name]}{optional && <span> ({c.fields.optional})</span>}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} aria-invalid={wrong?.name === name || undefined} aria-describedby={wrong?.name === name ? "wrong" : undefined} />
      {wrong?.name === name && <p className="field-error" id="wrong">{wrong.say}</p>}
    </div>
  );

  return (
    <form name="contact" className="form" onSubmit={submit} noValidate>
      <input type="hidden" name="form-name" value="contact" />
      <p hidden><label>{c.fields.honeypot} <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <div className="field">
        <label htmlFor="reason">{c.reasonLabel}</label>
        <select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {c.reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {field("name", "text", "name")}
      {field("email", "email", "email")}
      {field("company", "text", "organization", true)}
      <div className="field is-wide">
        <label htmlFor="message">{c.fields.message}</label>
        <textarea id="message" name="message" rows={5} placeholder={c.reasons.find((r) => r.value === reason)?.placeholder} aria-invalid={wrong?.name === "message" || undefined} aria-describedby={wrong?.name === "message" ? "wrong" : undefined} />
        {wrong?.name === "message" && <p className="field-error" id="wrong">{wrong.say}</p>}
      </div>
      <div className="is-wide form-end">
        <button type="submit" className="button" disabled={state === "sending"}>{state === "sending" ? c.sending : c.submit}</button>
        {state === "failed" && <p className="field-error" role="alert">{c.failed} <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a></p>}
      </div>
    </form>
  );
}
