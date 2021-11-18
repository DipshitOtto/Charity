import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import { Button } from '../Button';
import './Home.css';

function Home() {
  const [info, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/info")
      .then((res) => res.json())
      .then((info) => setData(info));
  }, []);

  return (
    <>
    <div className='landing-container'>
      <h1>Charity</h1>
      <p>Pxls Templates, Information, and Utilities</p>
      <div className='landing-btns'>
        <Link to='#createTemplate' target='_top'>
          <Button className='btns' buttonStyle='btn--outline' buttonSize='btn--large'>
            Create a Template
          </Button>
        </Link>
        <a href={`https://discord.com/oauth2/authorize?client_id=${!info ? "803515771808251924" : info.appID}&scope=applications.commands%20bot&permissions=${!info ? "4228377680" : info.invitePerms}`} target='_blank' rel="noreferrer">
        <Button className='btns' buttonStyle='btn--primary' buttonSize='btn--large'>
          Add our Discord Bot <i className='fab fa-discord' />
        </Button>
        </a>
      </div>
      <div class="shape-divider1">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
        </svg>
      </div>
    </div>
    <div id='createTemplate' className='template1-container'>
      <h1>Step 1 - Process an image</h1>
      <p>Image Processing is Coming Soon!</p>
    </div>
    </>
  );
}

export default Home;