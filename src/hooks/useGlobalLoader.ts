import { useState, useCallback } from 'react';

interface UseGlobalLoaderReturn {
  isLoading: boolean;
  loadingText: string;
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  setLoadingText: (text: string) => void;
}

export const useGlobalLoader = (initialText: string = 'Loading...'): UseGlobalLoaderReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(initialText);

  const showLoader = useCallback((text?: string) => {
    if (text) {
      setLoadingText(text);
    }
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const updateLoadingText = useCallback((text: string) => {
    setLoadingText(text);
  }, []);

  return {
    isLoading,
    loadingText,
    showLoader,
    hideLoader,
    setLoadingText: updateLoadingText,
  };
};
