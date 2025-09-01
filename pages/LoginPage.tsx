import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@devvai/devv-code-backend';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Mail, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await auth.sendOTP(email);
      setStep('otp');
      toast({
        title: 'Verification code sent',
        description: 'Check your email for the verification code',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationCode) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await auth.verifyOTP(email, verificationCode);
      login(response.user);
      toast({
        title: 'Welcome to ForecastPro!',
        description: 'You have been successfully logged in',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ForecastPro</h1>
          </div>
          <p className="text-slate-600">Sign in to access your forecasting dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 'email' ? 'Enter your email' : 'Verify your email'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'email' ? (
              <div key="email" className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                  />
                </div>
                <Button 
                  onClick={handleSendOTP} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? 'Sending...' : 'Send verification code'}
                </Button>
              </div>
            ) : (
              <div key="otp" className="space-y-4">
                <div className="text-sm text-slate-600 text-center">
                  We sent a verification code to <strong>{email}</strong>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  />
                </div>
                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify and sign in'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('email')} 
                  className="w-full"
                >
                  Back to email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}