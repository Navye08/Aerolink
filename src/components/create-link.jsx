import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {UrlState} from "@/context";
import LinkModal from "./link-modal";

export function CreateLink({onSuccess}) {
  const [isOpen, setIsOpen] = useState(false);
  const {user} = UrlState();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-1.5 shadow-md shadow-blue-500/20"
      >
        <Plus className="h-4 w-4" />
        Create Link
      </Button>

      {isOpen && (
        <LinkModal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          mode="create"
          userId={user?.id}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

export default CreateLink;
