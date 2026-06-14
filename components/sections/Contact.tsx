"use client";

import { useState } from "react";
import { contactTxt } from "../../constants/texts";

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
          <p className="text-xs sm:text-sm md:text-base tracking-widest uppercase text-foreground/50 font-semibold">
            {contactTxt.subtitle}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {contactTxt.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed max-w-lg mx-auto">
            {contactTxt.description}
          </p>
        </div>

        {submitted ? (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl animate-fade-in font-semibold">
            ✨ Message simulated successfully! Thank you for reaching out.
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
                  className="bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-base w-full transition-all duration-300"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder={`${contactTxt.emailPlaceholder} *`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-base w-full transition-all duration-300"
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
                className="bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-base w-full transition-all duration-300"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-primary text-background rounded-full px-8 py-3 text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:scale-105 shadow-md active:scale-95"
              >
                {contactTxt.submitButton}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
