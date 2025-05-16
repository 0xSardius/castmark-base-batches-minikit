"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { UserProvider } from "./context/UserContext";

export function Providers(props: { children: ReactNode }) {
  // Add console logs to help debug initialization
  console.log(
    "Initializing providers with API key:",
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ? "[exists]" : "[missing]",
  );

  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      projectId="castmark"
      notificationProxyUrl="/api/notification"
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
      }}
    >
      <UserProvider>{props.children}</UserProvider>
    </MiniKitProvider>
  );
}
