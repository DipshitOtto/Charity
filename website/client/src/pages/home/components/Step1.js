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
import { useDropzone } from "react-dropzone";
import { LoadingButton } from "@mui/lab";
import styles from "./Step1.module.css";

const { Image } = require("charity-api");

const axios = require("axios").default;

function Step1(props) {
  const [file, setFile] = React.useState(null);
  const [processed, setProcessed] = React.useState("false");
  const [matchPalette, setMatchPalette] = React.useState("accurate");
  const [dithering, setDithering] = React.useState(false);

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
        };
        reader.readAsArrayBuffer(file);
      });
    },
  });

  async function processImage() {
    setProcessed("loading");
    if (matchPalette === "none") {
      setProcessed("true");
      setFile(file);
    } else {
      const info = await axios.get(`/api/info`, { responseType: "json" });
      const result = await Image.process(
        file.buffer,
        info.data.palette,
        matchPalette,
        dithering
      );
      const fileResult = new File([result.buffer], "processed.png", {
        type: "image/png",
      });
      setProcessed("true");
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
    link.download = "processed.png";
    link.setAttribute("href", file.preview);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className={styles.container} ref={props.step1}>
        <h1>Step 1 - Process your Image</h1>
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
                    Match Palette?:
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-label="matchPalette"
                    name="row-radio-buttons-group"
                    defaultValue="accurate"
                    value={matchPalette}
                    onChange={(e) => {
                      setMatchPalette(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="accurate"
                      control={<Radio color="white" />}
                      label="Accurate"
                    />

                    <FormControlLabel
                      value="fast"
                      control={<Radio color="white" />}
                      label="Fast"
                    />
                    <FormControlLabel
                      value="none"
                      control={<Radio color="white" />}
                      label="None"
                    />
                  </RadioGroup>
                  <FormControlLabel
                    control={<Checkbox className={styles.checkbox} />}
                    label="Dithering"
                    onChange={(e) => {
                      setDithering(e.target.checked);
                    }}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>
            <div className={styles.btns}>
              <LoadingButton
                className={styles.process}
                onClick={processImage}
                variant="contained"
                size="large"
                color="white"
                disabled={!file}
                loading={processed === "loading"}
              >
                Process&nbsp;
                <i className="fas fa-magic" />
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
                onClick={() => {
                  props.setProcessedImage(file);
                }}
                variant="contained"
                size="large"
                color="white"
                disabled={processed === "false" || processed === "loading"}
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
            d="M 0 66 L 28.5 56.5 C 57 47 114 28 171.2 19.8 C 228.3 11.7 285.7 14.3 342.8 29.8 C 400 45.3 457 73.7 514.2 80.3 C 571.3 87 628.7 72 685.8 55 C 743 38 800 19 857.2 20.7 C 914.3 22.3 971.7 44.7 1028.8 51.7 C 1086 58.7 1143 50.3 1171.5 46.2 L 1200 42 L 1200 -76 L 1171.5 -76 C 1143 -76 1086 -76 1028.8 -76 C 971.7 -76 914.3 -76 857.2 -76 C 800 -76 743 -76 685.8 -76 C 628.7 -76 571.3 -76 514.2 -76 C 457 -76 400 -76 342.8 -76 C 285.7 -76 228.3 -76 171.2 -76 C 114 -76 57 -76 28.5 -76 L 0 -76 Z"
            className={styles.shapeFill}
          />
        </svg>
      </div>
    </>
  );
}

export default Step1;
