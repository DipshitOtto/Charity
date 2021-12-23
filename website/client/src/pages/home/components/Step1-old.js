import React from "react";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import styles from "./Step1.module.css";

/*function Step1(props) {
  const [files, setFiles] = React.useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const images = files.map((file) => (
    <img
      key={file.preview.toString()}
      id="uploadedImage"
      src={file.preview}
      className={styles.image}
      alt="preview"
      ref={props.uploadedImage}
    />
  ));

  function uploadImage() {
    if (files.length) {
      props.setUploaded(files[0].preview.toString());
    }
  }

  return (
    <>
      <div className={styles.container} ref={props.step1}>
        <h1>Step 1 - Upload an Image</h1>
        <div className={styles.upload}>
          <div className={styles.dropZone} {...getRootProps()}>
            <input {...getInputProps()} />
            {!files.length && (
              <span>Drop an Image Here or Click to Upload</span>
            )}
            {images}
          </div>
          <div className={styles.btns}>
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
                <p>Advanced Upload Options are Coming Soon!</p>
              </AccordionDetails>
            </Accordion>
            <Button
              className={styles.confirm}
              onClick={uploadImage}
              variant="contained"
              size="large"
              color="white"
              disabled={!files.length}
            >
              Continue&nbsp;
              <i className="fas fa-chevron-right" />
            </Button>
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
            d="M 0 53 L 28.5 61.3 C 57 69.7 114 86.3 171.2 89.8 C 228.3 93.3 285.7 83.7 342.8 67.2 C 400 50.7 457 27.3 514.2 28 C 571.3 28.7 628.7 53.3 685.8 69.8 C 743 86.3 800 94.7 857.2 81.7 C 914.3 68.7 971.7 34.3 1028.8 21.3 C 1086 8.3 1143 16.7 1171.5 20.8 L 1200 25 L 1200 -50 L 1171.5 -50 C 1143 -50 1086 -50 1028.8 -50 C 971.7 -50 914.3 -50 857.2 -50 C 800 -50 743 -50 685.8 -50 C 628.7 -50 571.3 -50 514.2 -50 C 457 -50 400 -50 342.8 -50 C 285.7 -50 228.3 -50 171.2 -50 C 114 -50 57 -50 28.5 -50 L 0 -50 Z"
            className={styles.shapeFill}
          />
        </svg>
      </div>
    </>
  );
}

export default Step1;*/
