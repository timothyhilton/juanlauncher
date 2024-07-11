import { Button } from "@renderer/components/ui/button";
import { VersionDropdown } from "./components/version_dropdown";
import { useState } from "react";

export default function App(){
  const [build, setBuild] = useState('')

  const onClick = () => {
    window.electron.ipcRenderer.send('launch');
  }

  return(
    <div className="">
      <VersionDropdown value={build} setValue={setBuild} />
      <Button onClick={onClick}>
        launch
      </Button>
    </div>
  )
}