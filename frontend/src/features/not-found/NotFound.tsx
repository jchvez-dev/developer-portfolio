import { useNavigate } from "react-router-dom";
import { FaGhost } from "react-icons/fa";
import { Heading, Text, Button } from "../../components/ui";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FaGhost className="mx-auto h-24 w-24 text-gray-200 dark:text-gray-800" />
      <Heading as="h1" className="text-8xl font-extrabold text-gray-200 dark:text-gray-800">
        404
      </Heading>
      <Heading as="h2" className="mt-4">
        Page not found
      </Heading>
      <Text muted className="mt-2 max-w-md">
        The page you are looking for does not exist or has been moved.
      </Text>
      <Button className="mt-8" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </div>
  );
};
