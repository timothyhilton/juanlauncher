"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@renderer/utils"
import { Button } from "@renderer/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@renderer/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@renderer/components/ui/popover"
import { useEffect, useState } from "react"

type releasesData = [
    {
      tag_name: string
      assets: [
        {
          browser_download_url: string
          name
        }
      ]
    }
]

export function VersionDropdown({value, setValue, onBuildSelect} : {value: string, setValue: any, onBuildSelect: (build: string) => void}) {
  const [open, setOpen] = useState(false)
  const [builds, setBuilds] = useState([''])

  useEffect(() => {
    fetch('https://api.github.com/repos/timothyhilton/juanclient/releases')
        .then(async res =>{
            const releasesData: releasesData = await res.json()
            console.log(releasesData)
            const tempBuilds: string[] = []
            releasesData.forEach(release => tempBuilds.push(release.tag_name))

            setBuilds(tempBuilds)
        })
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? builds.find(build => build === value)
            : "Select build..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="search builds..." />
          <CommandEmpty>no builds found</CommandEmpty>
          <CommandGroup>
            <CommandList>
                {builds.map(build =>
                <CommandItem
                    value={build}
                    onSelect={currentValue => {
                    setValue(currentValue === value ? "" : currentValue)
                    onBuildSelect(currentValue)
                    setOpen(false)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === build ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {build}
                </CommandItem>
                )}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}