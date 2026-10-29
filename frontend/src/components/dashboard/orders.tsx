"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Order } from "@/lib/types";
import { apiClient } from "@/lib/api";

interface OrdersProps{
  token: string;
}

export function Orders({ token }: OrdersProps){

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try{
      const response = await apiClient<Order[]>("/orders?draft=false", {
        method: "GET",
        cache: "no-store",
        token: token
      })

      setOrders(response)
      setLoading(false);
    }catch(error){
      setLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    async function loadOrders() {
      await fetchOrders();
    }

    loadOrders();
  }, [])

  return(
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pedidos</h1>
          <p className="text-sm sm:text-base mt-1">Gerencie os pedidos da cozinha</p>
        </div>

        <Button className="bg-brand-primary text-white hover:bg-brand-primary">
          <RefreshCcw className="w-5 h-5"/>
        </Button>
      </div>
    </div>
  )
}