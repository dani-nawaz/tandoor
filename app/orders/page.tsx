"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/types/order"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [nameFilter, setNameFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [orderTypeFilter, setOrderTypeFilter] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("")
  const [noteFilter, setNoteFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const today = new Date()
    fetchOrders(today)
  }, [])

  useEffect(() => {
    filterOrders()
  },  [nameFilter, orderTypeFilter, paymentMethodFilter, noteFilter, orders]) //Fixed unnecessary dependencies

  useEffect(() => {
    if (!dateFilter) return
    const filterDate = new Date(dateFilter)
    fetchOrders(filterDate)
  }, [dateFilter])

  const fetchOrders = async (date: Date) => {
    date.setHours(0, 0, 0, 0)

    setIsLoading(true)
    try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("createdAt", date.toISOString())
      .order("createdAt", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (nameFilter) {
      filtered = filtered.filter((order) =>
        order.items.some((item) => item.name.toLowerCase().includes(nameFilter.toLowerCase())),
      )
    }

    if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString()
        filtered = filtered.filter((order) => 
          new Date(order.createdAt).toDateString() === filterDate
        )
    }
    if (orderTypeFilter && orderTypeFilter !== "All") {
        filtered = filtered.filter((order) => order.orderType === orderTypeFilter)
      }
    
      if (paymentMethodFilter && paymentMethodFilter !== "All") {
        filtered = filtered.filter((order) => order.paymentMethod === paymentMethodFilter)
      }

    if (noteFilter) {
      filtered = filtered.filter((order) => order.note.toLowerCase().includes(noteFilter.toLowerCase()))
    }

    setFilteredOrders(filtered)
  }

  const handleDelete = async (id: number) => {
    setDeletingOrder(id)
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id)

      if (error) throw error

      setOrders(orders.filter((order) => order.id !== id))
      toast({
        title: "Success",
        description: "Order deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingOrder(null)
    }
  }

  const handleUpdateOrder = async (id: number, field: "orderType" | "paymentMethod", value: string) => {
    console.log("Updating order", id, field, value)
    setUpdatingOrder(id)
    try {
      const { error } = await supabase
        .from("orders")
        .update({ [field]: value })
        .eq("id", id)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === id ? { ...order, [field]: value } : order)))
      toast({
        title: "Success",
        description: `Order ${field} updated successfully.`,
      })
    } catch (error) {
      console.error(`Error updating order ${field}:`, error)
      toast({
        title: "Error",
        description: `Failed to update order ${field}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  const SkeletonRow = () => (
    <TableRow>
      {[...Array(7)].map((_, index) => (
        <TableCell key={index}>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </TableCell>
      ))}
    </TableRow>
  )

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <Link href="/">
            <Button>New Order</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 items-end">
            <div>
              <Label htmlFor="nameFilter">Filter by Name</Label>
              <Input
                id="nameFilter"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
                        <div>
              <Label htmlFor="noteFilter">Search by Note</Label>
              <Input
                id="noteFilter"
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                placeholder="Enter note content"
              />
            </div>
            <div>
              <Label htmlFor="dateFilter">Filter by Date</Label>
              <Input id="dateFilter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="orderTypeFilter">Filter by Order Type</Label>
              <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Order Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem> {/*Fixed empty value*/}
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethodFilter">Filter by P. Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem> {/*Fixed empty value*/}
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row items-end justify-end col-span-2 md:col-span-3 lg:col-span-5 gap-2">
              <Button onClick={()=>{
                setNameFilter("")
                setDateFilter("")
                setOrderTypeFilter("")
                setPaymentMethodFilter("")
                setNoteFilter("")
                setFilteredOrders(orders)
                fetchOrders(new Date())
              }} variant="secondary">Reset Filters</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
                : filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell>{order.items.map((item) => item.name).join(", ")}</TableCell>
                      <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.orderType}
                          onValueChange={(value) => handleUpdateOrder(order.id, "orderType", value)}
                          disabled={updatingOrder === order.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            {updatingOrder === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="pickup">Pickup</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.paymentMethod}
                          onValueChange={(value) => handleUpdateOrder(order.id, "paymentMethod", value)}
                          disabled={updatingOrder === order.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            {updatingOrder === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{order.note}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          disabled={deletingOrder === order.id}
                        >
                          {deletingOrder === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

