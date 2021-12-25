import React from "react";
import { TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useDropzone } from "react-dropzone";
import styles from "./Step3.module.css";

const axios = require("axios").default;

function Step3(props) {
  const [file, setFile] = React.useState(null);
  const [templateName, setTemplateName] = React.useState("");
  const [templateLink, setTemplateLink] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [ratelimit, setRatelimit] = React.useState("");

  const step3 = React.useRef();

  React.useEffect(() => {
    if (props.templatizedImage) {
      setFile(props.templatizedImage);
      setDisabled(false);
      step3.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [props.templatizedImage]);

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
          setDisabled(false);
        };
        reader.readAsArrayBuffer(file);
      });
    },
  });

  function generateTemplateLink() {
    setDisabled(true);
    setLoading(true);
    if (file) {
      const data = new FormData();
      data.append("file", file);
      axios
        .post("/api/upload", data)
        .then(async (res) => {
          const info = await axios.get(`/api/info`, { responseType: "json" });
          const img = new Image();
          img.src = file.preview;
          img.onload = function () {
            setTemplateLink(
              `${info.data.pxlsURL}#template=${encodeURIComponent(
                res.data
              )}&tw=${img.width / props.templateScale}&oo=1&ox=${Math.floor(
                (info.data.width - img.width / props.templateScale) / 2
              )}&oy=${Math.floor(
                (info.data.height - img.width / props.templateScale) / 2
              )}&x=${Math.floor(info.data.width / 2)}&y=${Math.floor(
                info.data.height / 2
              )}&scale=1&title=${encodeURIComponent(templateName)}`
            );
            setLoading(false);
            setRatelimit("");
          };
        })
        .catch((error) => {
          if (error.response.status === 429) {
            setDisabled(false);
            setLoading(false);
            setRatelimit("Slow down! You can't upload images this quickly!");
          }
        });
    }
  }

  return (
    <>
      <div className={styles.container} ref={step3}>
        <h1>Step 3 - Generate a Template Link</h1>
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
          <TextField
            className={styles.templateName}
            id="templateName"
            label="Template Name"
            variant="outlined"
            onChange={(e) => {
              if (templateLink !== "" && e.target.value !== "") {
                setTemplateLink(`${templateLink.split('&title=')[0]}&title=${encodeURIComponent(e.target.value)}`);
              }
              setTemplateName(e.target.value);
            }}
          />
          <div className={styles.btns}>
            <p className={styles.ratelimit}>{ratelimit}</p>
            <LoadingButton
              className={styles.generate}
              onClick={generateTemplateLink}
              variant="contained"
              size="large"
              color="white"
              loading={loading}
              disabled={!file || !templateName.length || disabled}
            >
              Generate&nbsp;
              <i className="fas fa-link" />
            </LoadingButton>
          </div>
          <div className={styles.templateLink}>
            {templateLink ? (
              <a href={templateLink} target="_blank" rel="noopener noreferrer">
                {templateLink}
              </a>
            ) : (
              <span className={styles.templateLinkPlaceholder}>
                Template Link Not Generated Yet!
              </span>
            )}
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
            d="M 0 14 L 28.5 26 C 57 38 114 62 171.2 62.3 C 228.3 62.7 285.7 39.3 342.8 30.8 C 400 22.3 457 28.7 514.2 44.5 C 571.3 60.3 628.7 85.7 685.8 82.5 C 743 79.3 800 47.7 857.2 48.7 C 914.3 49.7 971.7 83.3 1028.8 99.8 C 1086 116.3 1143 115.7 1171.5 115.3 L 1200 115 L 1200 -68 L 1171.5 -68 C 1143 -68 1086 -68 1028.8 -68 C 971.7 -68 914.3 -68 857.2 -68 C 800 -68 743 -68 685.8 -68 C 628.7 -68 571.3 -68 514.2 -68 C 457 -68 400 -68 342.8 -68 C 285.7 -68 228.3 -68 171.2 -68 C 114 -68 57 -68 28.5 -68 L 0 -68 Z"
            className={styles.shapeFill}
          />
        </svg>
      </div>
    </>
  );
}

export default Step3;
