import ContactForm from "./ContactForm";
import { homeContent } from "@/content/home";
import { siteContent } from "@/content/site";

export default function Contact() {
  const c = homeContent.contact;
  return (
    <section id="contact" className="band contact">
      <div>
        <h2>{c.title}</h2>
        <p className="lede">{c.body}</p>
        <p className="mail">{c.orMail} <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a></p>
      </div>
      <ContactForm />
    </section>
  );
}
