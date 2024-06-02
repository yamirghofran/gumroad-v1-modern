import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const CheckoutReturn = () => {
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(null);
  const [link, setLink] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const connectedAccountId = params.get('connected_account_id');
    setSessionId(sessionId);
    setConnectedAccountId(connectedAccountId);
    console.log(sessionId);
  }, [location]);

  useEffect(() => {
    if (sessionId) {
      const fetchSessionDetails = async () => {
        try {
          const response = await fetch(`http://localhost:3000/checkout-session/${sessionId}/${connectedAccountId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          const data = await response.json();
          setSessionDetails(data);
        } catch (error) {
          console.error('Error fetching session details:', error);
        }
      };

      fetchSessionDetails();
    }
  }, [sessionId, connectedAccountId]);

  useEffect(() => {
    if (sessionDetails) {
      console.log("Session Details", sessionDetails);
      const fetchFiles = async () => {
        try {
          const linkId = sessionDetails.metadata.linkId;
          const response = await axios.get(`http://localhost:3000/links-paid/${linkId}`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log("Link response", response.data.link);
          setLink(response.data.link);
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      };

      fetchFiles();
    }
  }, [sessionDetails]);

  console.log(sessionDetails);
  if (!sessionDetails) {
    return <div>Loading...</div>;
  }
  console.log(link);
  return (
    <div className='w-full flex justify-center mt-12 h-screen'>
        <div className='w-1/2'>
        <h3 className='text-2xl font-bold'>{sessionDetails.customer_details.name}, thank you for your purchase</h3>
      <p className='mt-4'>Here are the files. You can download them by clicking on them.</p>
        <h4>{link?.name} - ${link?.price}</h4>
        <ul>
        {link?.files.map(file => (
              <li key={file._id}>
                {file.file_type.startsWith('image/') ? (
                <div>
                    <img className="max-w-72 rounded-lg border border-black" src={`https://d22i4ig9f71y3u.cloudfront.net/${link.user}/${url}/${file.file_name}`} rel="noopener noreferrer" alt={file.file_name}/>
                </div>
                ) : (
                  <a className="text-blue-800 underline" href={`https://d22i4ig9f71y3u.cloudfront.net/${link.user}/${link.url}/${file.file_name}`} rel="noopener noreferrer" download>
                    {file.file_name}
                  </a>
                )}
              </li>
              ))}
        </ul>
        </div>
      
    </div>
  );
};

export default CheckoutReturn;