"use client";

import { AuthResult, auth } from "@/backend/backend";
import { WATERMARK } from "@/shared/shared";
import { ZResult, err, getErrorMessage } from "@/shared/util";
import { ETHBERLIN04, ZuAuthArgs, zuAuthPopup } from "@pcd/zuauth";
import { useState } from "react";
import { useCtx } from "../AppContext";
import { Button } from "@/components/ui/button";

const LOGIN_CONFIG: ZuAuthArgs = {
  fieldsToReveal: {
    revealAttendeeSemaphoreId: true
  },
  watermark: WATERMARK.toString(),
  config: [
    {
      eventName: "0xPARC Summer",
      pcdType: "eddsa-ticket-pcd",
      publicKey: ETHBERLIN04[0].publicKey,
      productName: "Superuser",
      productId: "324e7d6b-e0af-416c-b27a-1d091a156ca5",
      eventId: "654a38cd-de57-4093-9d21-5418e217db1e"
    }
  ],
  returnUrl: "http://localhost:4001"
};

export function LoginButton() {
  const [authResult, setAuthResult] = useState<ZResult<AuthResult> | undefined>(
    undefined
  );
  const [loggingIn, setLoggingIn] = useState(false);

  const ctx = useCtx();

  return (
    <Button
      className="w-full"
      disabled={loggingIn}
      onClick={async () => {
        try {
          setLoggingIn(true);
          const popupResult = await zuAuthPopup(LOGIN_CONFIG);
          const authValue = await auth(popupResult);
          if (authValue.success) {
            ctx.update({
              loginState: {
                token: authValue.data.token
              }
            });
          } else {
            ctx.update({
              loginState: undefined
            });
          }
        } catch (e) {
          setAuthResult(err(getErrorMessage(e)));
        } finally {
          setLoggingIn(false);
        }
      }}
    >
      {loggingIn ? "Logging in..." : "Login to Poast"}
    </Button>
  );
}
