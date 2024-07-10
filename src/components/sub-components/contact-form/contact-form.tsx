"use client"

import React, { useState, useRef } from "react";
import emailjs from "emailjs-com";

import { LoadingScreen } from "..";
import styles from "./contact-form.module.scss";

type Props = {
  setIsSuccess: (isSuccess: boolean) => void;
};

const ContactFormSubComponent = ({ setIsSuccess }: Props) => {
  const form = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // EmailJS sendForm method
    emailjs
      .sendForm(
        process.env.VITE_EMAILJS_SERVICE_ID || "",
        process.env.VITE_EMAILJS_TEMPLATE_ID1 || "",
        event.target as HTMLFormElement,
        process.env.VITE_EMAILJS_API_PUBLIC_KEY || ""
      )
      .then(
        () => {
          setIsSuccess(true);
          if (form.current) {
            form.current.reset(); // Reset the form fields
          }
          console.log("SUCCESS!");

          setIsLoading(false);
          // Hide the success message after 3 seconds
          setTimeout(() => {
            setIsSuccess(false);
          }, 3000);
        },
        (error) => {
          setIsLoading(false);
          console.log("FAILED...", error.text);
        }
      );
  };

  return (
    <div className={styles.contactForm__container}>
      {isLoading && <LoadingScreen />}
      <div className={styles.title}>Contact Form</div>
      <form ref={form} onSubmit={handleSubmit}>
        <div className={styles.email}>
          <input type="text" placeholder="Name" name="from_name" required />
          <input
            type="email"
            placeholder="Email address"
            name="from_email"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            name="mail_subject"
            required
          />
          <textarea
            name="message"
            cols={30}
            rows={5}
            placeholder="Message"
            required
          ></textarea>
        </div>
        <button type="submit" className={styles.submitBtn}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ContactFormSubComponent;
