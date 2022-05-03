import { useEffect, useState } from "react";

const LOCALSTORAGE_KEY_NAME = "hasReadInstructions";

export const useInstructions = (defaultValue = false) => {
  const [showInstructions, setShowInstructions] = useState(defaultValue);

  useEffect(() => {
    const hasReadInstructions = localStorage.getItem(LOCALSTORAGE_KEY_NAME);

    if (!hasReadInstructions) {
      // Force the user to read instructions if they have never read it before
      setShowInstructions(true);
    }
  }, []);

  const toggleInstructions = () => {
    const hasReadInstructions = localStorage.getItem(LOCALSTORAGE_KEY_NAME);

    setShowInstructions((prevState) => {
      if (!hasReadInstructions) {
        localStorage.setItem(LOCALSTORAGE_KEY_NAME, "true");
      }

      return !prevState;
    });
  };

  return {
    showInstructions,
    toggleInstructions,
  };
};
