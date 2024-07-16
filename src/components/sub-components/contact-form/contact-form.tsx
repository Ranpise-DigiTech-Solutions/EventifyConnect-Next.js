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
