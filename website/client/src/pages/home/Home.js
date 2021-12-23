import React, { createRef, useRef, useState, useCallback } from "react";
import "../../App.css";

import Landing from "./components/Landing";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
//import Step4 from "./components/Step4";
import Settings from "./components/Settings";

function Home() {
  const step1 = createRef();

  const [processedImage, setProcessedImage] = React.useState(null);

  return (
    <>
      <Landing step1={step1}/>
      {/*<Step1 step1={step1} uploadedImage={uploadedImage} uploaded={uploaded} setUploaded={setUploaded}/>*/}
      <Step1 step1={step1} processedImage={processedImage} setProcessedImage={setProcessedImage}/>
      <Step2 />
      <Step3 processedImage={processedImage} setProcessedImage={setProcessedImage}/>
      <Settings />
    </>
  );
}

export default Home;