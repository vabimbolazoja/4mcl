import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../../attached_assets/logoSvg.svg"
import paymentService from "../services/payment-service"
import { useLocation } from "wouter";
import { ThreeDots } from "react-loader-spinner";

import { Progress } from 'antd'
export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [processorStatus, setProcessorStatus] = useState("")
    const [orderRef, setOrderRef] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [location, setLocation] = useLocation();
    const [isResending, setIsLoadingResend] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    useEffect(() => {

        setIsLoading(true)
        var urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("order_id");
        const ref = urlParams.get("reference");
        const orderref = urlParams.get("order_ref");
        if (id && ref) {
            setOrderRef(orderref)
            verifyPayment(id, ref)

        }

    }, [])

    const verifyPayment = async (id: any, ref: any) => {
        try {
            const result = await paymentService.verify({ ref: ref, id: id });
            if (result) {
                setIsLoading(false)
                setProcessorStatus(result?.paystack?.data?.status)
                localStorage.clear();
                toast({
                    title: "Order Verification",
                    description: 'Payment Verification Successful',
                });
            }
            else {
                setIsLoading(false)
                toast({
                    title: "Order Verification",
                    description: result?.message,
                    variant: "destructive",
                });

            }
        } catch (err: any) {
            toast({
                title: "Order Verification",
                description: err?.response?.data?.message,
                variant: "destructive",
            });
            setIsLoading(false)

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
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Welcome Back </CardTitle>
                        <p className="text-slate-600">{processorStatus === 'success' ? 'Your order payment has been completed, Our team will reach out to you and process your delivery to provided address' : 'Your order payment has been submitted'}</p>
                        {processorStatus === 'success' &&
                            <p style={{fontWeight:'700'}}>YOUR TRACKING ORDER REF is : <br />{orderRef}</p>}
                    </CardHeader>

                    <CardContent className="pt-0">
                        <form className="space-y-6">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="animate__animated  animate__pulse">
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div>
                                            {isLoading ?
                                                <ThreeDots
                                                    visible={isLoading}
                                                    height="80"
                                                    width="80"
                                                    color="#10b981"
                                                    radius="9"
                                                    ariaLabel="three-dots-loading"
                                                    wrapperStyle={{}}
                                                    wrapperClass=""
                                                /> :
                                                <div>
                                                    <Progress type="circle" percent={100} />

                                                </div>}
                                        </div>
                                    </div>
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