import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => apiRequest('POST', '/api/newsletter/subscribe', { email }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    subscribeMutation.mutate(email);
  };

  return (
    <section className="bg-primary-600 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Stay Connected with Your Heritage
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Get the latest products, recipes, and special offers delivered to your inbox
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-0 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-primary-300 focus:outline-none text-base"
                disabled={subscribeMutation.isPending}
              />
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="bg-white text-primary-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-base w-full"
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </form>
          
          <p className="text-primary-200 text-xs sm:text-sm mt-3 sm:mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
