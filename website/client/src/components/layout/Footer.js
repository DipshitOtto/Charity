import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const axios = require('axios').default;

function Footer() {
  const [info, setInfo] = React.useState(null);

  React.useEffect(() => {
    axios.get("/api/info")
      .then((res) => setInfo(res.data))
  }, []);

  return (
    <div className={styles.container}>
      <p className={styles.thirdParty}>
        Charity is a third party website. We are not directly affiliated with
        Pxls.
      </p>
      <section className={styles.socialMedia}>
        <div className={styles.socialMediaWrap}>
          <div>
            <Link to="/" className={styles.socialLogo}>
              Charity
              <img
                className={styles.icon}
                src="./images/profile.png"
                alt="charity"
              />
            </Link>
          </div>
          <div className={styles.socialIcons}>
            <a
              className={styles.socialIconLink}
              href={!info ? "https://discord.gg/anBdazHcrH" : info.discordURL}
              target="_blank"
              aria-label="Discord"
              rel="noopener noreferrer"
            >
              <i className="fab fa-discord" />
            </a>
            <a
              className={styles.socialIconLink}
              href={!info ? "https://patreon.com/pxlscharity" : info.patreonURL}
              target="_blank"
              aria-label="Patreon"
              rel="noopener noreferrer"
            >
              <i className="fab fa-patreon" />
            </a>
          </div>
          <p className={styles.attribution}>
            Created by&nbsp;
            <a href="http://mikarific.com" target="_blank" rel="noopener noreferrer">
              Mikarific
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Footer;
