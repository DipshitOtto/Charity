import React from "react";
import "../../App.css";
import "./ComingSoon.css";

function ComingSoon() {
  return (
    <>
      <div className="comingsoon-container">
        <h1>Coming Soon™</h1>
        <p>This feature isn't done yet!</p>
      </div>
      <div className="shape-divider cssd-primary">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 39 L 28.5 32 C 57 25 114 11 171.2 5.7 C 228.3 0.3 285.7 3.7 342.8 22.7 C 400 41.7 457 76.3 514.2 95.8 C 571.3 115.3 628.7 119.7 685.8 103.8 C 743 88 800 52 857.2 41.7 C 914.3 31.3 971.7 46.7 1028.8 63.7 C 1086 80.7 1143 99.3 1171.5 108.7 L 1200 118 L 1200 -54 L 1171.5 -54 C 1143 -54 1086 -54 1028.8 -54 C 971.7 -54 914.3 -54 857.2 -54 C 800 -54 743 -54 685.8 -54 C 628.7 -54 571.3 -54 514.2 -54 C 457 -54 400 -54 342.8 -54 C 285.7 -54 228.3 -54 171.2 -54 C 114 -54 57 -54 28.5 -54 L 0 -54 Z"
            className="shape-fill"
          />
        </svg>
      </div>
    </>
  );
}

export default ComingSoon;
