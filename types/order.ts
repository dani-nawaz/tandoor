export interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  items: OrderItem[]
  paymentMethod: string
  orderType: string
  note: string
  total: number
  createdAt: string
}

