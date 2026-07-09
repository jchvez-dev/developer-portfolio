import { CanvasPreview } from "./CanvasPreview";
import { Heading } from "../../components/ui";

export const StudioPage = () => {
  return (
    <div className="p-8">
      <Heading as="h2" className="mb-4">
        Canvas Studio
      </Heading>
      <CanvasPreview />
    </div>
  );
};
