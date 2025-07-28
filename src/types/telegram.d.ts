export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: string;
        themeParams: Record<string, string>;
        isExpanded: boolean;
        isClosingConfirmationEnabled: boolean;
        isVisible: boolean;
        sendData: (data: string) => void;
        close: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        ready: () => void;
      };
    };
  }
}
