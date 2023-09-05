import { useEffect } from "react";
import { APEnergyContractService } from "./service/APEnergyContractService"
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const App = () => {
  const energyContractService = APEnergyContractService.getInstance();

  useEffect(() => {
    (async () => {
      // get globalStates - get accounts (metamask) & participants
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
      </Routes>
    </BrowserRouter>
  )
}