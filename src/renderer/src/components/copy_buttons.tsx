import { useState } from "react";
import { Button } from "@renderer/components/ui/button";
import { Loader2 } from "lucide-react";

export function CopyButtons() {
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingResourcePacks, setIsLoadingResourcePacks] = useState(false);

  const copyGameSettings = async () => {
    setIsLoadingSettings(true);
    try {
      await window.electron.ipcRenderer.invoke('copyGameSettings');
      console.log('Game settings copied successfully');
    } catch (error) {
      console.error('Error copying game settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const copyResourcePacks = async () => {
    setIsLoadingResourcePacks(true);
    try {
      await window.electron.ipcRenderer.invoke('copyResourcePacks');
      console.log('Resource packs copied successfully');
    } catch (error) {
      console.error('Error copying resource packs:', error);
    } finally {
      setIsLoadingResourcePacks(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 z-10 relative">
      <Button 
        onClick={copyGameSettings} 
        variant="outline" 
        size="sm"
        disabled={isLoadingSettings}
      >
        {isLoadingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Copy Game Settings
      </Button>
      <Button 
        onClick={copyResourcePacks} 
        variant="outline" 
        size="sm"
        disabled={isLoadingResourcePacks}
      >
        {isLoadingResourcePacks && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Copy Resource Packs
      </Button>
    </div>
  );
}