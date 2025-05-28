import Icon from "@/components/icon_component/createIcon";
import { Button } from "@/components/ui/button";
import { siGithub, siX } from "simple-icons";

const Footer = () => {
  return (
    <footer className="text-center w-full py-6 bg-black">
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
        >
          <Icon icon={siGithub} />
          <span className="sr-only">GitHub</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
        >
          <Icon icon={siX} />
          <span className="sr-only">Twitter</span>
        </Button>
      </div>
      <p className="text-sm text-gray-400">(c) 2024 5OR4dev. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
