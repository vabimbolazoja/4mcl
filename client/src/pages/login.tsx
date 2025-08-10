import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../../attached_assets/logoSvg.svg"
import authService from "../services/auth-service"
import { useLocation } from "wouter";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isResending,setIsLoadingResend] =  useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      email: formData?.email,
      password: formData?.password
    }
    try {
      const result = await authService.login(data);
      if (result) {
        setIsLoading(false)
        var token = result?.token;
        sessionStorage.setItem('4mttoken', token)
        sessionStorage.setItem('4mtfname', result?.firstName + " " + result?.lastName)
        sessionStorage.setItem('username', result?.firstName)
        sessionStorage?.setItem('4mtxxd',result?.user._id)
        sessionStorage.setItem('4mtxxm',result.user.email)

        toast({
          title: "Login Successful",
          description: result?.message,
        });
        setTimeout(() => {
          setLocation('/')
        },1400)
      }
      else{
        setIsLoading(false)
        toast({
          title: "Login failed",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err:any) {
      setIsLoading(false)
      toast({
        title: "Login failed",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  };

  const resendVerify = async () => {
    setIsLoadingResend(true);
    try {
      const result = await authService.resendMailVerify({email:formData?.email});
      if (result) {
        setIsLoadingResend(false)
        toast({
          title: "Resend Verification Mail",
          description: result?.message,
        });
      }
      else{
        setIsLoadingResend(false)
        toast({
          title: "Resend Verification Mail",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err:any) {
      setIsLoadingResend(false)
      toast({
        title: "Resend Verification Mail",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <span className="text-2xl font-bold text-slate-900">
              <img src={Logo} />
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</CardTitle>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="" onClick={resendVerify}>
                  <span className=" text-sm text-primary-600 hover:text-primary-700">{isResending ? "Sending" : "Resend Verification Mail?"}</span>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign up here
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}