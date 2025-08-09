import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@4marketdays.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "123 Business St, Suite 100",
      description: "New York, NY 10001"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Fri: 9AM-6PM EST",
      description: "Sat: 10AM-4PM EST"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-emerald-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              Contact <span className="text-primary-600">Us</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our products or need help with your order? 
              We're here to help you connect with your culinary heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <info.icon className="text-primary-600 h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{info.title}</h3>
                  <p className="text-slate-900 font-medium mb-1 text-sm sm:text-base">{info.content}</p>
                  <p className="text-slate-600 text-xs sm:text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Send us a Message</h2>
              <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                Fill out the form below and we'll get back to you as soon as possible. 
                Whether you have questions about our products, need help with an order, 
                or want to partner with us, we'd love to hear from you.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="Your full name"
                    />
                  </div>
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
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto px-8 py-3 shadow-lg"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Frequently Asked Questions</h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">How long does shipping take?</h4>
                  <p className="text-slate-600 text-sm sm:text-base">Most orders arrive within 3-7 business days depending on your location.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Do you ship internationally?</h4>
                  <p className="text-slate-600 text-sm sm:text-base">Yes! We ship to most countries worldwide. Shipping costs and times vary by destination.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">What's your return policy?</h4>
                  <p className="text-slate-600 text-sm sm:text-base">We offer a 30-day return policy for non-perishable items in original condition.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Are your products authentic?</h4>
                  <p className="text-slate-600 text-sm sm:text-base">Absolutely! We source directly from trusted suppliers across Africa to ensure authenticity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}