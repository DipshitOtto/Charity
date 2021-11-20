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
        <Button className='btns' buttonStyle='btn--outline' buttonSize='btn--large' onClick={() => {document.getElementById('createTemplate').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'})}}>
          Create a Template
        </Button>
        <a href={`https://discord.com/oauth2/authorize?client_id=${!info ? "803515771808251924" : info.appID}&scope=applications.commands%20bot&permissions=${!info ? "4228377680" : info.invitePerms}`} target='_blank' rel="noreferrer">
        <Button className='btns' buttonStyle='btn--primary' buttonSize='btn--large'>
          Add our Discord Bot <i className='fab fa-discord' />
        </Button>
        </a>
      </div>
    </div>
    <div class="shape-divider tsd-primary">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
      </svg>
    </div>
    <div id='createTemplate' className='template-container template-orange'>
      <h1>Step 1 - Upload an Image</h1>
      <p>Image Uploading is Coming Soon!</p>
    </div>
    <div class="shape-divider tsd-orange">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M 0 53 L 28.5 61.3 C 57 69.7 114 86.3 171.2 89.8 C 228.3 93.3 285.7 83.7 342.8 67.2 C 400 50.7 457 27.3 514.2 28 C 571.3 28.7 628.7 53.3 685.8 69.8 C 743 86.3 800 94.7 857.2 81.7 C 914.3 68.7 971.7 34.3 1028.8 21.3 C 1086 8.3 1143 16.7 1171.5 20.8 L 1200 25 L 1200 -50 L 1171.5 -50 C 1143 -50 1086 -50 1028.8 -50 C 971.7 -50 914.3 -50 857.2 -50 C 800 -50 743 -50 685.8 -50 C 628.7 -50 571.3 -50 514.2 -50 C 457 -50 400 -50 342.8 -50 C 285.7 -50 228.3 -50 171.2 -50 C 114 -50 57 -50 28.5 -50 L 0 -50 Z" class="shape-fill"/>
      </svg>
    </div>
    <div className='template-container template-yellow'>
      <h1>Step 2 - Process your Image</h1>
      <p>Image Processing is Coming Soon!</p>
    </div>
    <div class="shape-divider tsd-yellow">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M 0 66 L 28.5 56.5 C 57 47 114 28 171.2 19.8 C 228.3 11.7 285.7 14.3 342.8 29.8 C 400 45.3 457 73.7 514.2 80.3 C 571.3 87 628.7 72 685.8 55 C 743 38 800 19 857.2 20.7 C 914.3 22.3 971.7 44.7 1028.8 51.7 C 1086 58.7 1143 50.3 1171.5 46.2 L 1200 42 L 1200 -76 L 1171.5 -76 C 1143 -76 1086 -76 1028.8 -76 C 971.7 -76 914.3 -76 857.2 -76 C 800 -76 743 -76 685.8 -76 C 628.7 -76 571.3 -76 514.2 -76 C 457 -76 400 -76 342.8 -76 C 285.7 -76 228.3 -76 171.2 -76 C 114 -76 57 -76 28.5 -76 L 0 -76 Z" class="shape-fill"/>
      </svg>
    </div>
    <div className='template-container template-green'>
      <h1>Step 3 - Templatize your Image</h1>
      <p>Templatizing is Coming Soon!</p>
    </div>
    <div class="shape-divider tsd-green">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M 0 113 L 28.5 115 C 57 117 114 121 171.2 117.7 C 228.3 114.3 285.7 103.7 342.8 84.3 C 400 65 457 37 514.2 32.7 C 571.3 28.3 628.7 47.7 685.8 65 C 743 82.3 800 97.7 857.2 87.5 C 914.3 77.3 971.7 41.7 1028.8 24 C 1086 6.3 1143 6.7 1171.5 6.8 L 1200 7 L 1200 -50 L 1171.5 -50 C 1143 -50 1086 -50 1028.8 -50 C 971.7 -50 914.3 -50 857.2 -50 C 800 -50 743 -50 685.8 -50 C 628.7 -50 571.3 -50 514.2 -50 C 457 -50 400 -50 342.8 -50 C 285.7 -50 228.3 -50 171.2 -50 C 114 -50 57 -50 28.5 -50 L 0 -50 Z" class="shape-fill"/>
      </svg>
    </div>
    <div className='template-container template-blue'>
      <h1>Step 4 - Generate a Template Link</h1>
      <p>Generating Template Links is Coming Soon!</p>
    </div>
    <div class="shape-divider tsd-blue">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M 0 14 L 28.5 26 C 57 38 114 62 171.2 62.3 C 228.3 62.7 285.7 39.3 342.8 30.8 C 400 22.3 457 28.7 514.2 44.5 C 571.3 60.3 628.7 85.7 685.8 82.5 C 743 79.3 800 47.7 857.2 48.7 C 914.3 49.7 971.7 83.3 1028.8 99.8 C 1086 116.3 1143 115.7 1171.5 115.3 L 1200 115 L 1200 -68 L 1171.5 -68 C 1143 -68 1086 -68 1028.8 -68 C 971.7 -68 914.3 -68 857.2 -68 C 800 -68 743 -68 685.8 -68 C 628.7 -68 571.3 -68 514.2 -68 C 457 -68 400 -68 342.8 -68 C 285.7 -68 228.3 -68 171.2 -68 C 114 -68 57 -68 28.5 -68 L 0 -68 Z" class="shape-fill"/>
      </svg>
    </div>
    <div className='template-container template-purple'>
      <h1>Settings</h1>
      <p>Settings are Coming Soon!</p>
    </div>
    <div class="shape-divider tsd-purple">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M 0 39 L 28.5 32 C 57 25 114 11 171.2 5.7 C 228.3 0.3 285.7 3.7 342.8 22.7 C 400 41.7 457 76.3 514.2 95.8 C 571.3 115.3 628.7 119.7 685.8 103.8 C 743 88 800 52 857.2 41.7 C 914.3 31.3 971.7 46.7 1028.8 63.7 C 1086 80.7 1143 99.3 1171.5 108.7 L 1200 118 L 1200 -54 L 1171.5 -54 C 1143 -54 1086 -54 1028.8 -54 C 971.7 -54 914.3 -54 857.2 -54 C 800 -54 743 -54 685.8 -54 C 628.7 -54 571.3 -54 514.2 -54 C 457 -54 400 -54 342.8 -54 C 285.7 -54 228.3 -54 171.2 -54 C 114 -54 57 -54 28.5 -54 L 0 -54 Z" class="shape-fill"/>
      </svg>
    </div>
    </>
  );
}

export default Home;