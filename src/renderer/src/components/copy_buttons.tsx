import { useState } from "react";
import { Button } from "@renderer/components/ui/button";
import { Loader2 } from "lucide-react";
import { Notification } from "./notification";

export function CopyButtons() {
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingResourcePacks, setIsLoadingResourcePacks] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const copyGameSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const result = await window.electron.ipcRenderer.invoke('copyGameSettings');
      setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
    } catch (error) {
      setNotification({ message: 'Error copying game settings', type: 'error' });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const copyResourcePacks = async () => {
    setIsLoadingResourcePacks(true);
    try {
      const result = await window.electron.ipcRenderer.invoke('copyResourcePacks');
      setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
    } catch (error) {
      setNotification({ message: 'Error copying resource packs', type: 'error' });
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}