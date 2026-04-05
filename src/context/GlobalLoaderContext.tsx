import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalLoader } from '../hooks/useGlobalLoader';
import GlobalLoader from '../components/GlobalLoader';

interface GlobalLoaderContextType {
  isLoading: boolean;
  loadingText: string;
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  setLoadingText: (text: string) => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

// External controller to allow non-React modules (e.g., Axios) to toggle the loader
let externalShow: (text?: string) => void = () => {};
let externalHide: () => void = () => {};
let externalSetText: (text: string) => void = () => {};

export const GlobalLoaderController = {
  show: (text?: string) => externalShow(text),
  hide: () => externalHide(),
  setText: (text: string) => externalSetText(text),
};

interface GlobalLoaderProviderProps {
  children: ReactNode;
}

export const GlobalLoaderProvider: React.FC<GlobalLoaderProviderProps> = ({ children }) => {
  const loaderState = useGlobalLoader();

  // Wire external controller on each render to keep latest refs
  externalShow = loaderState.showLoader;
  externalHide = loaderState.hideLoader;
  externalSetText = loaderState.setLoadingText;

  return (
    <GlobalLoaderContext.Provider value={loaderState}>
      {children}
      <GlobalLoader visible={loaderState.isLoading} text={loaderState.loadingText} />
    </GlobalLoaderContext.Provider>
  );
};

export const useGlobalLoaderContext = (): GlobalLoaderContextType => {
  const context = useContext(GlobalLoaderContext);
  if (context === undefined) {
    throw new Error('useGlobalLoaderContext must be used within a GlobalLoaderProvider');
  }
  return context;
};
