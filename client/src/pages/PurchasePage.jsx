import { useParams } from 'react-router-dom';
import { fetchPurchaseLink } from '@/components/queries/fetchers';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import EmbeddedCheckoutComponent from '@/components/stripeCheckout.jsx';

function PurchasePage() {
    const { url } = useParams();
    const { data: link, error, isLoading } = fetchPurchaseLink(url);
    const [clientSecret, setClientSecret] = useState(null);

    useEffect(() => {
      if (error) {
        console.error('Error fetching purchase link:', error);
      }
    }, [error]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error loading purchase link</div>;
    }

    if (link) {
      console.log(link)
    }

    const handleBuyClick = async () => {
      try {
        const response = await fetch('http://localhost:3000/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            id: link._id,
            name: link.name,
            price: link.price,
            quantity: 1
          })
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating checkout session:', error);
      }
    };

    return (
      <div className="min-h-[calc(100vh_-_theme(spacing.16))] flex items-center justify-center">
        <div className="max-w-[500px] w-full">
          <h1 className="text-3xl font-bold">{link.name} - ${link.price}</h1>
          <ul>
            {link.files.map((file) => (
              <li key={file.id}>{file.file_name} - {file.file_type}</li>
            ))}
          </ul>
        </div>
        {clientSecret ? (
          <EmbeddedCheckoutComponent linkId={link._id} clientSecret={clientSecret} />
        ) : (
          <Button onClick={handleBuyClick}>Buy</Button>
        )}
      </div>
    );
  }

export default PurchasePage