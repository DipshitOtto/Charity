import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import './Navbar.css';

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

  window.addEventListener('resize', showButton);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            Charity <img className='navbar-icon' src='./images/profile.png' alt='charity' />
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/templates' className='nav-links' onClick={closeMobileMenu}>
                Templates
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/progress' className='nav-links' onClick={closeMobileMenu}>
                Progress
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/statistics' className='nav-links' onClick={closeMobileMenu}>
                Statistics
              </Link>
            </li>
            <li>
              <Link to='/signup' className='nav-links-mobile' onClick={closeMobileMenu}>
                Sign Up
              </Link>
            </li>
          </ul>
          <Link to='/signup' onClick={closeMobileMenu}>
            {button && <Button buttonStyle='btn--outline'>SIGN UP</Button>}
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;