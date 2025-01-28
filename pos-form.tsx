"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/legacy/image"
import { Banknote, Clock, CreditCard, Store, Truck, Minus, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/types/order"
import Link from "next/link"

interface Item {
  name: string
  quantity: number
  selected: boolean
  price: number
  src: string
}
const data = [
  {
    name: "Sada Roti",
    quantity: 0,
    selected: false,
    price: 15,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-45WwEazqnFU9l6Z8dB4ksUDWqZefVq.png",
  },
  {
    name: "k. Roti",
    quantity: 0,
    selected: false,
    price: 30,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-89N6gSQE3BSKP3ED7sg3jXdorFOjkq.png",
  },
  {
    name: "Kulcha",
    quantity: 0,
    selected: false,
    price: 40,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6j3vwC0VyqxeQ33Ywyn2VUAvtYsz6S.png",
  },
  {
    name: "Sada Nan",
    quantity: 0,
    selected: false,
    price: 30,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hzMUfQNP09HiDMZMq9joO6FN1Ykvyc.png",
  },
  {
    name: "Roghni Nan",
    quantity: 0,
    selected: false,
    price: 80,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hzMUfQNP09HiDMZMq9joO6FN1Ykvyc.png",
  },
  {
    name: "Alo w. Nan",
    quantity: 0,
    selected: false,
    price: 80,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hzMUfQNP09HiDMZMq9joO6FN1Ykvyc.png",
  },
  {
    name: "Channy",
    quantity: 0,
    selected: false,
    price: 100,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0knmn69ClwqZiBzwRbc4eWNsf5wDlN.png",
  },
  {
    name: "Paratha",
    quantity: 0,
    selected: false,
    price: 20,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nmvkOg0rBM7ESBIa9Jm074nEk9cmDX.png",
  },
]
export default function POSForm() {
  const [items, setItems] = useState<Item[]>(JSON.parse(JSON.stringify(data)))
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [orderType, setOrderType] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [total, setTotal] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.selected ? item.quantity * item.price : 0), 0)
    setTotal(newTotal)
  }, [items])

  const handleItemChange = (index: number, field: "selected" | "quantity" | "price", value: boolean | number) => {
    const newItems = [...items]
    if (field === "selected") {
      newItems[index].selected = value as boolean
      if (value && newItems[index].quantity === 0) {
        newItems[index].quantity = 1
      } else if (!value) {
        newItems[index].quantity = 0
      }
    } else if (field === "quantity") {
      newItems[index].quantity = value as number
      if (value > 0 && !newItems[index].selected) {
        newItems[index].selected = true
      } else if (value === 0) {
        newItems[index].selected = false
      }
    } else if (field === "price") {
      newItems[index].price = value as number
    }
    setItems(newItems)
  }

  const handleIncrement = (index: number, field: "quantity" | "price") => {
    const newItems = [...items]
    if (field === "quantity") {
      newItems[index].quantity += 1
      if (!newItems[index].selected) {
        newItems[index].selected = true
      }
    } else {
      newItems[index].price += 5
    }
    setItems(newItems)
  }

  const handleDecrement = (index: number, field: "quantity" | "price") => {
    const newItems = [...items]
    if (field === "quantity") {
      if (newItems[index].quantity > 0) {
        newItems[index].quantity -= 1
        if (newItems[index].quantity === 0) {
          newItems[index].selected = false
        }
      }
    } else {
      if (newItems[index].price >= 5) {
        newItems[index].price -= 5
      }
    }
    setItems(newItems)
  }

  const saveOrderToSupabase = async (orderData: Order) => {
    try {
      const { data, error } = await supabase.from("orders").insert([orderData]).select()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to save order")
      }

      if (!data) {
        throw new Error("No data returned from Supabase")
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save order: ${error.message}`)
      }
      throw new Error("An unexpected error occurred")
    }
  }

  const handlePrint = async () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: "Please select an order type",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    const selectedItems = items.filter((item) => item.selected)
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData: Order = {
        items: selectedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        })),
        paymentMethod,
        orderType,
        note,
        total,
        createdAt: new Date().toISOString(),
      }
      console.log("Order Data:", orderData)
      await saveOrderToSupabase(orderData)

      toast({
        title: "Success",
        description: "Your order has been successfully saved to the database.",
      })
      debugger
      setItems(data)
      setPaymentMethod("")
      setOrderType("")
      setNote("")
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <Card className="w-full max-w-2xl shadow-none drop-shadow-none border-none bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">POS Order Form</CardTitle>
            <Link href="/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {items.map((item, index) => (
              <Card
                key={item.name}
                className={`overflow-hidden shadow-none drop-shadow-none border-none cursor-pointer bg-gray-50 ${
                  item.selected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleItemChange(index, "selected", !item.selected)}
              >
                <CardContent className="p-0">
                  <div className="relative h-40">
                    <Image
                      src={item.src || "/placeholder.svg"}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      priority={true}
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">{item.name}</Label>
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => handleItemChange(index, "selected", checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">Quantity</Label>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDecrement(index, "quantity")
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="text-center w-16"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.currentTarget.select()
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIncrement(index, "quantity")
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500">Price (Rs.)</Label>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDecrement(index, "price")
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            step="5"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value) || 0)}
                            className="text-center w-16"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.currentTarget.select()
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIncrement(index, "price")
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-none drop-shadow-none border-none bg-gray-50">
            <CardContent className="p-4">
              <Label className="text-lg font-semibold mb-2 block">Order Type</Label>
              <RadioGroup value={orderType} onValueChange={setOrderType} className="grid grid-cols-2 gap-4">
                <Label
                  htmlFor="delivery"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                  <Truck className="mb-3 h-6 w-6" />
                  Delivery
                </Label>
                <Label
                  htmlFor="pickup"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                  <Store className="mb-3 h-6 w-6" />
                  Pickup
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="shadow-none drop-shadow-none border-none bg-gray-50">
            <CardContent className="p-4">
              <Label className="text-lg font-semibold mb-2 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="cash" id="cash" className="sr-only" />
                  <Banknote className="mb-3 h-6 w-6" />
                  Cash
                </Label>
                <Label
                  htmlFor="pending"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="pending" id="pending" className="sr-only" />
                  <Clock className="mb-3 h-6 w-6" />
                  Pending
                </Label>
                <Label
                  htmlFor="online"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="online" id="online" className="sr-only" />
                  <CreditCard className="mb-3 h-6 w-6" />
                  Online
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-lg font-semibold">
              Note
            </Label>
            <Textarea
              id="note"
              placeholder="Add any additional notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">Total: Rs. {total.toFixed(2)}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePrint} className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? "Saving Order..." : "Print Order"}
          </Button>
        </CardFooter>
      </Card>
  )
}

