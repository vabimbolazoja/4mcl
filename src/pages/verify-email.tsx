import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../../attached_assets/logoSvg.svg"
import authService from "../services/auth-service"
import Cookie from "js-cookie"
import mailbox from "../../attached_assets/shape-box.svg"
import { ThreeDots } from "react-loader-spinner";
export default function VerifyMail() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");


  const confirmMail =  async() => {
    setIsLoading(true)
    try {
      const result = await authService.verifyMail(token);
      if (result) {
        setIsLoading(false)
        if(result?.status === 200){
       
            toast({
              title: "Email Verification",
              description: "Email verified successfully.",
            });
            setTimeout(() => {
              window.location.href = "/login";
            },3000)
          }
        
      }
      else{
        setIsLoading(false)
        toast({
          title: "Email Verification",
          description: result?.message,
          variant: "destructive",
        });
      }

    
    } catch (err:any) {
      setIsLoading(false)
      toast({
        title: "Email Verification",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    confirmMail()
  },[])




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      email: formData?.email,
      password: formData?.password
    }
    try {
      console.log('right here 1')
      const result = await authService.login(data);
      console.log('right here 2')
      console.log(result)
      if (result) {
        setIsLoading(false)
        if (result?.status === 200) {
          var token = result.user?.token;
          sessionStorage.setItem('token', token)
          Cookie.set('token-xtx', token)
          Cookie.set('_idd', result.user.id)
          var userResp = result.user;
          if (userResp) {
            if (userResp?.status) {
              toast({
                title: "Login Successful",
                description: "",
              });
            } else {

              toast({
                title: "Login failed",
                description: "Email not verified yet.",
                variant: "destructive",
              });
              window.location.href = "/verify-email";
            }
          }
        }
        else {
          toast({
            title: "Login failed",
            description: result?.message,
            variant: "destructive",
          });
        }

      }
    } catch (err: any) {
      setIsLoading(false)
      toast({
        title: "Login failed",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  };

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
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Email Verification </CardTitle>
            <p className="text-slate-600">{isLoading ? "Email Verified Successfully" : "Verify your email account to continue and enjoy our service"}</p>
          </CardHeader>

          <CardContent className="py-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="animate__animated  animate__pulse">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ThreeDots
                    visible={isLoading}
                    height="20"
                    width="50"
                    color="#10b981"
                    radius="9"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  /></div>
                  <img src={mailbox} />
                </div>
              </div>




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