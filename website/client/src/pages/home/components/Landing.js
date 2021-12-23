import React from "react";
import { Button, Alert, Collapse } from "@mui/material";
import styles from "./Landing.module.css";

const axios = require('axios').default;

function Landing(props) {
  const [info, setInfo] = React.useState(null);
  const [alert, setAlert] = React.useState(true);

  React.useEffect(() => {
    axios.get("/api/info")
      .then((res) => setInfo(res.data))
  }, []);

  return (
    <>
      <div className={styles.container}>
        <Collapse in={alert}>
          <Alert onClose={() => {setAlert(false)}} variant="filled" severity="warning">
            Charity is in Beta! Some features may not be complete!
          </Alert>
        </Collapse>
        <h1>Charity</h1>
        <p>Pxls Templates, Information, and Utilities</p>
        <div className={styles.btns}>
          <Button
            onClick={() => {
              props.step1.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
              });
            }}
            variant="outlined"
            size="large"
            color="white"
          >
            Create a Template
          </Button>
          <Button
            href={`https://discord.com/oauth2/authorize?client_id=${
              !info ? "803515771808251924" : info.appID
            }&scope=applications.commands%20bot&permissions=${
              !info ? "4228377680" : info.invitePerms
            }`}
            target="_blank"
            rel="noreferrer"
            variant="contained"
            size="large"
            color="white"
          >
            Add our Discord Bot&nbsp;
            <i className="fab fa-discord" />
          </Button>
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
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className={styles.shapeFill}
          ></path>
        </svg>
      </div>
    </>
  );
}

export default Landing;
