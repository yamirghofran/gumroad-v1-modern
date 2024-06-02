import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.

const getUserStripeAccountId = async (linkId) => {
  try {
    const response = await fetch(`http://localhost:3000/link/${linkId}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return data.user.stripeAccountId;
  } catch (error) {
    console.error('Error fetching user stripe account ID:', error);
    return null;
  }
};

const EmbeddedCheckoutComponent = ({linkId, clientSecret}) => {
  const [stripePromise, setStripePromise] = useState(null);

  

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeAccount = await getUserStripeAccountId(linkId);
      if (stripeAccount) {
        const stripe = loadStripe('pk_test_51PM8D5GvJVtKG6XifZTY3uWNjeKXU5ZcsvIGU5KT56wlyMBVC6kLqYqhwf1wHvh37ehrjpPptaCpbQHJkJJ1K7O200uxcfOMfz', {
          stripeAccount: stripeAccount,
        });
        setStripePromise(stripe);
      }
    };

    initializeStripe();
  }, []);

  if (!stripePromise) {
    return <div>Loading...</div>;
  }

  const options = {clientSecret};
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={options}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}

export default EmbeddedCheckoutComponent;
