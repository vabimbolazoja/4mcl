import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import config from "../../src/config"
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios'
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, CreditCard, Truck, Eye, MapPin, Phone, Mail, X } from "lucide-react";
import { GlobalStateContext } from "../context/globalContext"
import { Modal } from 'antd'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: string;
    imageUrl: string;
    moq: Number;
}

interface Order {
    id: string;
    date: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAID';
    total: string;
    currency: 'USD' | 'NGN';
    items: OrderItem[];
    shippingAddress: string;
    customerInfo?: {
        name: string;
        email: string;
        phone: string;
    };
    paymentMethod?: string;
    subtotal?: string;
    // orderNotes?: string;
}

export default function OrderHistory() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { toast } = useToast();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [`${config.baseurl}api/stores`],
        queryFn: () =>
            axios
                .get(`${config.baseurl}stores`)
                .then((res) => res.data),
        retry: 1,

    });



    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">STORE LOCATIONS </h1>
                    <p className="text-slate-600">get to see store locations around you</p>
                </div>
                <br />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Postal Code</TableHead>
                            <TableHead>Country</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.store?.map((product) => (
                            <TableRow key={product.id}>

                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product?.address}</TableCell>
                                <TableCell>{product?.state}</TableCell>
                                <TableCell>{product?.postalcode}</TableCell>
                                <TableCell>{product?.country}</TableCell>



                            </TableRow>
                        ))}
                    </TableBody>
                    <br />

                </Table>
            </div>

        </div>
    );
}