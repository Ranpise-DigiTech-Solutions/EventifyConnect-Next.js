import React from 'react';
import styles from './page.module.scss';

type Props = {}

const PrivacyPolicyPage = (props: Props) => {
  return (
    <div className={styles.privacyPolicy__container}>
    <h1 className={styles.heading}>Privacy Policy</h1>
    <p className={styles.summary}>
      Our management has created this Privacy Statement (Policy) to
      demonstrate our firm commitment to help our users better understand what
      information we collect about them and what may happen to that
      information.
      <br />
      The terms &quot;We, EventifyConnect, Us&quot; refer to <a href="https://eventifyconnect.netlify.app">eventifyconnect.com</a> and the terms &quot;You, Your&quot; refer to a user
      of <a href="https://eventifyconnect.netlify.app">eventifyconnect.com</a>.
      <br />
      In the course of our business of helping our viewers plan their events,
      we collect certain information from you.
    </p>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Information Collection</h2>
      <p className={styles.description}>
        In the course of registering for and availing various services we
        provide through our website: EventifyConnect, you may be required to
        give your Name, address, Email address, phone number.
        <br />
        The Personal Information is used for three general purposes: to
        customize the content you see, to fulfill your requests for certain
        services, and to contact you about our services. Unless otherwise stated
        explicitly, this Policy applies to Personal Information as disclosed on
        any of the Media.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Legal Compliance and GDPR</h2>
      <p className={styles.description}>
        Dear Users, EventifyConnect undertakes and acknowledges to be compliant
        with all necessary legal requirements and compliances and is in the
        process of executing the GDPR regulations & compliances on its website{" "}
        <a rel='noopener noreferrer' href="https://eventifyconnect.netlify.app" target="_blank">
          https://www.eventifyconnect.com
        </a>{" "}
        for all our relevant users. The Data we collect and use is upon your
        consent and none of our activities amount to a breach of GDPR
        compliance. We value your security and privacy and are doing our best to
        ensure the security of the data you provide to us in any manner
        whatsoever. We acknowledge your consent for providing such data to us
        for the smooth execution of our services and note your acceptance to
        providing us with all information so collected, including Name, Gender,
        Email, Contact Number, Age, Location, Device Details, Browsing
        Information, SMS, App Install and Usage, Preferences, Intent, etc.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Security</h2>
      <p className={styles.description}>
        Personal Information will be kept confidential and we do not disclose
        the information except in cases where you have specifically made an
        enquiry. Further, the vendors/advertisers who are listed with us, may
        call you, based on the query or enquiry that you make with us, enquiring
        about any Product/Service they might offer.
        <br />
        We will share Personal Information only under one or more of the
        following circumstances:
        <br />
      </p>
      <ul className={styles.list}>
        <li>If we have your consent or deemed consent to do so.</li>
        <li>If we are compelled by law (including court orders) to do so.</li>
      </ul>
      <p className={styles.description}>
        In furtherance of the confidentiality with which we treat Personal
        Information, we have put in place appropriate physical, electronic, and
        managerial procedures to safeguard and secure the information we collect
        online. We give you the ability to edit your account information and
        preferences at any time, including whether you want us to contact you
        regarding any services. To protect your privacy and security, we will
        also take reasonable steps to verify your identity before granting
        access or making corrections. We treat data as an asset that must be
        protected against loss and unauthorized access. We employ many different
        security techniques to protect such data from unauthorized access by
        members inside and outside the company. However, &quot;perfect
        security&quot; does not exist on the Internet, or anywhere else in the
        world! You therefore agree that any security breaches beyond the control
        of our standard security procedures are at your sole risk and
        discretion.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Links to Other Websites</h2>
      <p className={styles.description}>
        We have affiliate links to many other online resources. We are not
        responsible for the practices employed by these affiliates or their
        websites linked to or from EventifyConnect.com nor the information or
        content contained on these third-party websites. You should carefully
        review their privacy statements and other conditions of use, and you
        agree you provide information or engage in transactions with these
        affiliates at your own risk.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Control of Your Password</h2>
      <p className={styles.description}>
        You are responsible for all actions taken with your login information
        and password, including fees. Therefore, we do not recommend that you
        disclose your account password or login information to any third
        parties. If you lose control of your password, you may lose substantial
        control over your personally identifiable information and may be subject
        to legally binding actions taken on your behalf. Therefore, if your
        password has been compromised for any reason, you should immediately
        change your password.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Content on the site</h2>
      <p className={styles.description}>
        EventifyConnect.com features some of the latest trends in event planning
        around the world, and tries to give its users exposure to quality
        hand-picked content. In our endeavor, we feature pictures and stories
        from various real events and vendors. Vendors are expected to take
        utmost care to take permission/hold copyright of images given to us. We
        also feature events and articles where users have given us permission to
        use the same.
        <br />
        However, in the unlikely event of anyone having any objection to content
        put up on our site, they are free to contact us immediately and
        we&apos;ll be happy to consider their request and take necessary action.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Updates on Privacy Policy</h2>
      <p className={styles.description}>
        As per company policies under no circumstances, we do not reveal any
        data collected from users and other vendors to any other third party. We
        visit our data privacy policies regularly to comply by any GDPR rules.
        <br />
        We reserve the right to revise these Privacy Policies of
        EventifyConnect.com from time to time by updating this posting. Such
        revised policies will take effect as of the date of posting.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Contact Us</h2>
      <p className={styles.description}>
        If you have any further queries regarding the privacy policy, feel free
        to contact us at <a href="mailto:samadhan.ranpise@gmail.com">info@eventifyconnect.com</a>.
      </p>
    </div>
    <h1 className={styles.heading}>User Data Policy</h1>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>Data points collected for users</h2>
      <p className={styles.description}>
        The following data points are being collected via the Facebook login
        process on our applications/website. These data points are:
      </p>
      <ul className={styles.list}>
        <li>Name of the user</li>
        <li>Email address</li>
        <li>Contact number</li>
      </ul>
    </div>
    <div className={styles.wrapper}>
      <h3 className={styles['sub-heading']}>
        How and Where User Information Taken via Google and Facebook Login is
        Used
      </h3>
      <table className={styles.table} border={1} cellSpacing="0" cellPadding="5">
        <thead>
          <tr>
            <th>Communication via Platforms like</th>
            <th>Analytics via Platforms like</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Clevertap:</strong> Sending out relevant and segmented marketing
              communications i.e. mobile & web notifications, email marketing.
              Tracking & analyzing campaigns, user properties, user behaviour on
              the platform to ensure correct/optimal communication goes out.
            </td>
            <td>
              <strong>Firebase:</strong> Track user traffic on the application (iOS and Android)
            </td>
          </tr>
          <tr>
            <td>
              <strong>Sendgrid:</strong> Transactional email communication such as login OTPs,
              information on in-app/website transactions by the user are sent &
              tracked
            </td>
            <td><strong>Branch.io:</strong> Tracks installs/downloads acquired via Facebook</td>
          </tr>
          <tr>
            <td>
              <strong>Mailchimp:</strong> Segmented audience list is sent out relevant marketing
              communications
            </td>
            <td>
              <strong>Google Analytics</strong> Track user traffic on the web through different
              sources and run ad campaigns via GoogleAds
            </td>
          </tr>
          <tr>
            <td>
              <strong>Karix:</strong> Used for triggering WhatsApp notifications to relevant user
              base
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <strong>One direct:</strong> Used for triggering WhatsApp communications & offering
              customer chat support via website
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <strong>Gupshup:</strong> For triggering Adhoc service implicit & service explicit
              SMSs to relevant & segmented user base
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles["sub-heading"]}>Why Do We Need/Use the Above-Mentioned Data Points</h2>
      <p className={styles.description}>
        In order to have access to all the features, benefits, or services on
        our Platform: connecting with the vendors listed on our platform,
        wedding planning assistance. In short, to provide a seamless experience
        to our users, a user must first create an account on our Platform.
        <br />
        In addition to the above basic data received from Facebook and other
        login methods, we also collect some additional optional data points for
        the user to avail of all the features, benefits, or services on our
        platform. A user can choose to provide some additional personal
        information allowing others, including us, to identify the User: Name,
        Gender, Email, Contact Number, Age, Location, Device Details,
        Preferences, etc. In addition, a user can choose to provide the images
        for personalizing their profile, submit a review for a vendor, etc.
        <br />
        We do not store users’ credit card information for any in-app/website
        transaction to avail of any benefit or service. Reputed third-party
        gateways are used to enable users to make such transactions. Only the
        user&apos;s email address is required and used as proof of payment
        confirmation.
      </p>
    </div>
    <div className={styles.wrapper}>
      <h2 className={styles['sub-heading']}>In Case of Data Deletions</h2>
      <p className={styles.description}>
        Users can request the deletion of data across all platforms. Requests
        for deletion can be sent via both Android and iOS applications.
        Alternatively, a user can write to us at{" "}
        <a href="mailto:samadhan.ranpise@gmail.com">info@eventifyconnect.com</a>.
      </p>
    </div>
  </div>
  )
}

export default PrivacyPolicyPage