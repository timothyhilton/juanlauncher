import { Button } from "@renderer/components/ui/button";

export default function App(){

  const onClick = () => {
    window.electron.ipcRenderer.send('ping');
  }

  return(
    <Button onClick={onClick}>
      test
    </Button>
  )
}