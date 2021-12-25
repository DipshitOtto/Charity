import React from "react";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useDropzone } from "react-dropzone";
import styles from "./Step2.module.css";

const { Image } = require("charity-api");

const axios = require("axios").default;

function Step2(props) {
  const [upload, setUpload] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [templatized, setTemplatized] = React.useState("false");
  const [style, setStyle] = React.useState("symbols");
  const [glow, setGlow] = React.useState(false);

  const step2 = React.useRef();

  React.useEffect(() => {
    if (props.processedImage) {
      setFile(props.processedImage);
      setUpload(props.processedImage);
      step2.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [props.processedImage]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFile(
            Object.assign(file, {
              preview: URL.createObjectURL(file),
              buffer: reader.result,
            })
          );
          setUpload(file);
        };
        reader.readAsArrayBuffer(file);
      });
    },
  });

  async function templatizeImage() {
    setTemplatized("loading");
    if (style === "none") {
      setTemplatized("true");
      setFile(upload);
    } else {
      const info = await axios.get(`/api/info`, { responseType: "json" });
      const result = await Image.templatize(
        upload.buffer,
        info.data.palette,
        style,
        glow
      );
      props.setTemplateScale(result.scale);
      const fileResult = new File([result.image.buffer], "templatized.png", {
        type: "image/png",
      });
      setTemplatized("true");
      setFile(
        Object.assign(fileResult, {
          preview: URL.createObjectURL(fileResult),
          buffer: result.buffer,
        })
      );
    }
  }

  function downloadButton() {
    const link = document.createElement("a");
    link.download = "templatized.png";
    link.setAttribute("href", file.preview);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className={styles.container} ref={step2}>
        <h1>Step 2 - Templatize your Image</h1>
        <div className={styles.subcontainer}>
          <div className={styles.dropZone} {...getRootProps()}>
            <input {...getInputProps()} />
            {!file ? (
              <>
                <i className={`fas fa-upload ${styles.uploadIcon}`} />
                <br />
                <span>Drop an Image Here or Click to Upload</span>
              </>
            ) : (
              <img
                key={file.preview.toString()}
                id="uploadedImage"
                src={file.preview}
                className={styles.image}
                alt="preview"
              />
            )}
          </div>
          <div>
            <Accordion className={styles.accordion}>
              <AccordionSummary
                expandIcon={
                  <i
                    className={`${styles.accordionIcon} fas fa-chevron-down`}
                  />
                }
              >
                Advanced Options
              </AccordionSummary>
              <AccordionDetails className={styles.details}>
                <FormControl component="fieldset">
                  <FormLabel color="white" component="legend">
                    Template Style:
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-label="matchPalette"
                    name="row-radio-buttons-group"
                    defaultValue="symbols"
                    onChange={(e) => {
                      setStyle(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="dotted-small"
                      control={<Radio color="white" />}
                      label="Dotted (Small, 1:2)"
                    />

                    <FormControlLabel
                      value="dotted-big"
                      control={<Radio color="white" />}
                      label="Dotted (Big, 2:2)"
                    />
                    <FormControlLabel
                      value="symbols"
                      control={<Radio color="white" />}
                      label="Symbols"
                    />
                    <FormControlLabel
                      value="numbers"
                      control={<Radio color="white" />}
                      label="Numbers"
                    />
                    <FormControlLabel
                      value="none"
                      control={<Radio color="white" />}
                      label="None"
                    />
                  </RadioGroup>
                  <FormControlLabel
                    control={<Checkbox className={styles.checkbox} />}
                    label="Glow?"
                    onChange={(e) => {
                      setGlow(e.target.checked);
                    }}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>
            <div className={styles.btns}>
              <LoadingButton
                className={styles.process}
                onClick={templatizeImage}
                variant="contained"
                size="large"
                color="white"
                disabled={!file}
                loading={templatized === "loading"}
              >
                Templatize&nbsp;
                <i className="fas fa-th-large" />
              </LoadingButton>
              <Button
                className={styles.download}
                onClick={downloadButton}
                variant="contained"
                size="large"
                color="white"
                disabled={!file}
              >
                Download&nbsp;
                <i className="fas fa-download" />
              </Button>
              <Button
                className={styles.continue}
                variant="contained"
                size="large"
                color="white"
                onClick={() => {
                  props.setTemplatizedImage(file);
                }}
                disabled={templatized === "false" || templatized === "loading"}
              >
                Continue&nbsp;
                <i className="fas fa-chevron-right" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.shapeDivider}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 113 L 28.5 115 C 57 117 114 121 171.2 117.7 C 228.3 114.3 285.7 103.7 342.8 84.3 C 400 65 457 37 514.2 32.7 C 571.3 28.3 628.7 47.7 685.8 65 C 743 82.3 800 97.7 857.2 87.5 C 914.3 77.3 971.7 41.7 1028.8 24 C 1086 6.3 1143 6.7 1171.5 6.8 L 1200 7 L 1200 -50 L 1171.5 -50 C 1143 -50 1086 -50 1028.8 -50 C 971.7 -50 914.3 -50 857.2 -50 C 800 -50 743 -50 685.8 -50 C 628.7 -50 571.3 -50 514.2 -50 C 457 -50 400 -50 342.8 -50 C 285.7 -50 228.3 -50 171.2 -50 C 114 -50 57 -50 28.5 -50 L 0 -50 Z"
            className={styles.shapeFill}
          />
        </svg>
      </div>
    </>
  );
}

export default Step2;
