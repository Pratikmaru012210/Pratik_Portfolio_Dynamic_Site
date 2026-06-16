"use client";

import { useState } from "react";
import { contactTxt } from "../../constants/texts";
import { Sparkles, Send } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16 md:py-20 animate-fade-in">
      <div className="max-w-xl sm:max-w-2xl w-full text-center space-y-6">
        <div className="space-y-3">
          <p className="text-overline text-foreground/50">
            {contactTxt.subtitle}
          </p>
          <h1 className="text-heading bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {contactTxt.title}
          </h1>
          <p className="text-body text-foreground/70 max-w-lg mx-auto">
            {contactTxt.description}
          </p>
        </div>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl animate-fade-in font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>Message simulated successfully! Thank you for reaching out.</span>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`${contactTxt.namePlaceholder} *`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-body-sm bg-neutral-900/40 text-foreground px-4 py-3 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md w-full transition-all duration-300 shadow-inner"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder={`${contactTxt.emailPlaceholder} *`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-body-sm bg-neutral-900/40 text-foreground px-4 py-3 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md w-full transition-all duration-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div>
              <textarea
                placeholder={contactTxt.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={5}
                className="text-body-sm bg-neutral-900/40 text-foreground px-4 py-3 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md w-full transition-all duration-300 shadow-inner"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="text-body-sm inline-flex items-center justify-center gap-2 bg-primary text-white rounded-full px-8 py-3.5 font-semibold cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{contactTxt.submitButton}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
