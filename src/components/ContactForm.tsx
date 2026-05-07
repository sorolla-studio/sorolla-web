"use client";

import { useState } from "react";
import { aboutContactFormContent } from "@/content/about";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-white text-center py-8">
        <p className="text-xl">{aboutContactFormContent.successMessage}</p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={() => setSubmitted(true)}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          {aboutContactFormContent.honeypotLabel} <input name="bot-field" />
        </label>
      </p>

      <div>
        <label htmlFor="email" className="block text-white mb-2">
          {aboutContactFormContent.emailLabel}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 rounded-full border-2 border-white/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-white mb-2">
          {aboutContactFormContent.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-3xl border-2 border-white/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white resize-none"
        />
      </div>

      <button
        type="submit"
        className="self-start bg-white text-coral px-8 py-3 font-semibold hover:bg-white/90 transition-colors"
      >
        {aboutContactFormContent.submitLabel}
      </button>
    </form>
  );
}
