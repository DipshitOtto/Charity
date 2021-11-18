import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
    const [info, setData] = React.useState(null);

    React.useEffect(() => {
      fetch("/info")
        .then((res) => res.json())
        .then((info) => setData(info));
    }, []);

    return (
        <div className='footer-container'>
            <p className='footer-third-party'>Charity is a third party website. We are not directly affiliated with Pxls.</p>
            <section class='social-media'>
                <div class='social-media-wrap'>
                    <div class='footer-logo'>
                        <Link to='/' className='social-logo'>Charity<img className='footer-icon' src='./images/profile.png' alt='charity' /></Link>
                    </div>
                    <div class='social-icons'>
                        <a class='social-icon-link discord' href={!info ? "https://discord.gg/anBdazHcrH" : info.discordURL} target='_blank' aria-label='Discord' rel="noreferrer">
                            <i class='fab fa-discord' />
                        </a>
                        <a class='social-icon-link patreon' href={!info ? "https://patreon.com/pxlscharity" : info.patreonURL} target='_blank' aria-label='Patreon' rel="noreferrer">
                            <i class='fab fa-patreon' />
                        </a>
                    </div>
                    <p className='footer-attribution'>Created by <a href='http://mikarific.com' target='_blank' rel="noreferrer">Mikarific</a></p>
                </div>
            </section>
        </div>
    );
}

export default Footer;