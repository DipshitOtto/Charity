import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import styles from "./Navbar.module.css";

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener("resize", showButton);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            Charity
            <img
              className={styles.icon}
              src="./images/profile.png"
              alt="charity"
            />
          </Link>
          <div className={styles.menuIcon} onClick={handleClick}>
            <i className={click ? `fas fa-times ${styles.times}` : `fas fa-bars ${styles.bars}`} />
          </div>
          <ul className={click ? `${styles.menu} ${styles.active}` : styles.menu}>
            <li className={styles.item}>
              <Link
                to="/templates"
                className={styles.links}
                onClick={closeMobileMenu}
              >
                Templates
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                to="/progress"
                className={styles.links}
                onClick={closeMobileMenu}
              >
                Progress
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                to="/statistics"
                className={styles.links}
                onClick={closeMobileMenu}
              >
                Statistics
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={styles.linksMobile}
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </li>
          </ul>
            {button && <Button component={Link} to="/signup" onClick={closeMobileMenu} variant="outlined" color="white">SIGN UP</Button>}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
