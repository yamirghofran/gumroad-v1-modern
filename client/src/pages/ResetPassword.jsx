import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { toast } from 'sonner';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  let token;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    token = query.get('token');
    if (token) {
      // You can now use the token in your component
      console.log('Token:', token);
    } else {
      // Handle the case where the token is not present in the URL
      console.error('Token not found in URL');
    }
  }, []);


  const handlePasswordChange = async () => {
    const response = await axios.post('http://localhost:3000/reset-password', { password, email, token });
    console.log(response);
    if (response.status === 200) {
      navigate('/login');
    } else {
      // Handle error
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="min-h-[calc(100vh_-_theme(spacing.16))] flex items-center justify-center">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="grid gap-4">
          <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" onClick={handlePasswordChange}>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword;
