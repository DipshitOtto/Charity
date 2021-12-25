import React, { createRef, useState } from "react";
import "../../App.css";

import Landing from "./components/Landing";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Settings from "./components/Settings";

function Home() {
  const step1 = createRef();

  const [processedImage, setProcessedImage] = useState(null);
  const [templatizedImage, setTemplatizedImage] = useState(null);
  const [templateScale, setTemplateScale] = useState(1);

  return (
    <>
      <Landing step1={step1}/>
      <Step1 step1={step1} processedImage={processedImage} setProcessedImage={setProcessedImage}/>
      <Step2 processedImage={processedImage} setProcessedImage={setProcessedImage} templatizedImage={templatizedImage} setTemplatizedImage={setTemplatizedImage} setTemplateScale={setTemplateScale}/>
      <Step3 templatizedImage={templatizedImage} setTemplatizedImage={setTemplatizedImage} templateScale={templateScale}/>
      <Settings />
    </>
  );
}

export default Home;
