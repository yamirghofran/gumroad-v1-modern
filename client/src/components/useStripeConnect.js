import { useState, useEffect } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";

const stripe_publishable_key = "pk_test_51PM8D5GvJVtKG6XifZTY3uWNjeKXU5ZcsvIGU5KT56wlyMBVC6kLqYqhwf1wHvh37ehrjpPptaCpbQHJkJJ1K7O200uxcfOMfz";

export const useStripeConnect = (connectedAccountId) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState();

  useEffect(() => {
    if (connectedAccountId) {
      const fetchClientSecret = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:3000/account_session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            account: connectedAccountId,
          }),
        });
        if (!response.ok) {
          // Handle errors on the client side here
          const { error } = await response.json();
          throw ("An error occurred: ", error);
        } else {
          const { client_secret: clientSecret } = await response.json();
          return clientSecret;
        }
      };

      setStripeConnectInstance(
        loadConnectAndInitialize({
          publishableKey: stripe_publishable_key,
          fetchClientSecret,
          appearance: {
            overlays: "dialog",
            variables: {
              colorPrimary: "#635BFF",
            },
          },
        })
      );
    }
  }, [connectedAccountId]);

  return stripeConnectInstance;
};

export default useStripeConnect;