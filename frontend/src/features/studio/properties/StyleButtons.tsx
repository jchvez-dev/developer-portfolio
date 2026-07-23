import { Button, Text } from "../../../components/ui";
import { HiBold, HiItalic } from "react-icons/hi2";
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
          icon={<HiBold className="h-4 w-4" />}
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<HiItalic className="h-4 w-4" />}
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
        />
      </div>
    </div>
  );
};
