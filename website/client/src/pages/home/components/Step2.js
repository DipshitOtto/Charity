import React from "react";
import styles from "./Step2.module.css";

function Step2() {
  return (
    <>
      <div className={styles.container}>
        <h1>Step 2 - Templatize your Image</h1>
        <p>Templatizing is Coming Soon!</p>
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
