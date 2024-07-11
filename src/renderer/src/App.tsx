import { Button } from "@renderer/components/ui/button";
import { VersionDropdown } from "./components/version_dropdown";
import { useState } from "react";

export default function App(){
  const [build, setBuild] = useState('')

  const onClick = () => {
    window.electron.ipcRenderer.send('launch', build);
  }

  return(
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="font-bold text-5xl mb-5">juan launcher</h1>
        <VersionDropdown value={build} setValue={setBuild} />
        <Button onClick={onClick} variant="outline">
          launch
        </Button>
      </div>
    </div>
  )
}