import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface WalletContextType {
  walletAddress: string;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(
  null
);

export const WalletProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [walletAddress, setWalletAddress] = useState("");

  const isConnected = !!walletAddress;

  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");

    if (saved) {
      setWalletAddress(saved);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const providerFactory =
        (window as any).CasperWalletProvider;

      if (!providerFactory) {
        alert("Casper Wallet no encontrada");
        return;
      }

      const provider =
        typeof providerFactory === "function"
          ? providerFactory(window)
          : providerFactory;

      await provider.requestConnection();

      const publicKey =
        (await provider.getActivePublicKey?.()) ||
        (await provider.requestActivePublicKey?.());

      if (!publicKey) return;

      const address = String(publicKey);

      setWalletAddress(address);

      localStorage.setItem(
        "walletAddress",
        address
      );
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectWallet = async () => {
    try {
      const providerFactory =
        (window as any).CasperWalletProvider;

      if (providerFactory) {
        const provider =
          typeof providerFactory === "function"
            ? providerFactory(window)
            : providerFactory;

        await provider.disconnect?.();
        await provider.requestDisconnect?.();
      }
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("walletAddress");
    setWalletAddress("");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWallet debe usarse dentro de WalletProvider"
    );
  }

  return context;
};