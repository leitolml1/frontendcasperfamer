import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { CasperFarmer } from "./CasperFarmer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CasperFarmer />
  </StrictMode>
);