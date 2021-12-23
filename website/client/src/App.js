import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/home/Home";
import ComingSoon from "./pages/comingsoon/ComingSoon";
import NotFound from "./pages/notfound/NotFound";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    white: {
      main: "#fff",
    },
  },
  typography: {
    fontFamily: "Patrick Hand",
    fontSize: 20,
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#fff"
        },
      },
    },
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/templates" element={<ComingSoon />} />
            <Route path="/progress" element={<ComingSoon />} />
            <Route path="/statistics" element={<ComingSoon />} />
            <Route path="/signup" element={<ComingSoon />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
