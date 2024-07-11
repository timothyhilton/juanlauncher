import { Button } from "@renderer/components/ui/button";
import { VersionDropdown } from "./components/version_dropdown";
import { AccountDropdown } from "./components/account_dropdown";
import { useState } from "react";
import { IUser } from "minecraft-launcher-core";
import { CopyButtons } from "./components/copy_buttons";

export default function App() {
  const [build, setBuild] = useState('')
  const [account, setAccount] = useState<IUser>()
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const checkBuildDownloaded = async (selectedBuild: string) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('checkBuildDownloaded', selectedBuild)
      setIsDownloaded(result)
    } catch (error) {
      console.error('Error checking build download status:', error)
      setIsDownloaded(false)
    }
  }

  const launch = async () => {
    if (!account) {
      console.error('No account selected')
      return
    }
  
    setIsLoading(true)
    try {
      if (!isDownloaded) {
        const downloadResult = await window.electron.ipcRenderer.invoke('download', build)
        if (!downloadResult.success) {
          console.error('Download failed:', downloadResult.error)
          return
        }
        setIsDownloaded(true)
      }
      const launchResult = await window.electron.ipcRenderer.invoke('launch', build, account)
      if (!launchResult.success) {
        console.error('Launch failed:', launchResult.error)
      }
    } catch (error) {
      console.error('IPC communication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return(
    <div className="flex flex-col h-screen">
      <div className="flex justify-between p-4">
        <CopyButtons />
        <AccountDropdown value={account} setValue={setAccount} />
      </div>
      <div className="flex-grow flex justify-center items-center mt-[-5rem]">
        <div className="text-center">
          <h1 className="font-bold text-5xl mb-5">juan launcher</h1>
          <VersionDropdown value={build} setValue={setBuild} onBuildSelect={checkBuildDownloaded} />
          {build && (
            <Button 
              onClick={launch} 
              variant="outline"
              disabled={isLoading || !account}
              className="relative mt-4"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 mr-2 absolute left-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span className={isLoading ? "ml-6" : ""}>
                {isDownloaded ? "Launch" : "Download & Launch"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}