import { useState, useEffect } from 'react';
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

type Account = {
    id: string;
    username: string;
};
  
export function AccountDropdown({ value, setValue }: { value: string, setValue: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const fetchedAccounts = await window.electron.ipcRenderer.invoke('getAccounts');
    setAccounts(fetchedAccounts);
  };

  const addAccount = async () => {
    const newAccount = await window.electron.ipcRenderer.invoke('addAccount');
    if (newAccount) {
      setAccounts([...accounts, newAccount]);
    }
  };

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
            ? accounts.find((account) => account.id === value)?.username
            : "Select account..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          {open ? <></> : <CommandEmpty className="mt-[0.6rem] mx-auto">No account found.</CommandEmpty>}
          <CommandGroup>
            <CommandList>
                {accounts.map((account) => (
                <CommandItem
                    key={account.id}
                    value={account.id}
                    onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === account.id ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {account.username}
                </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
          <Button onClick={addAccount} className="mx-1 my-1" variant="outline">Add Account</Button>
        </Command>
      </PopoverContent>
    </Popover>
  );
}