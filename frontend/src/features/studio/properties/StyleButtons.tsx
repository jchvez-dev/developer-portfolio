import { Button, Text } from "../../../components/ui";
import { BoldIcon, ItalicIcon } from "@heroicons/react/24/outline";
import { useCkEditor } from "../hooks/useCkEditor";

export const StyleButtons = () => {
  const { exec } = useCkEditor();

  return (
    <div>
      <Text small muted className="mb-1 block">
        Style
      </Text>
      <div className="flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          icon={<BoldIcon className="h-4 w-4" />}
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<ItalicIcon className="h-4 w-4" />}
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
        />
      </div>
    </div>
  );
};
