'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

type PaymentData = any

interface SocketContextType {
  payments: PaymentData[]
  isConnected: boolean
  connect: (paymentId: string) => void
  disconnect: () => void
  sendMoney?: (amount: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useShopsifuSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useShopsifuSocket must be used within a ShopsifuSocketProvider')
  }
  return context
}

export const ShopsifuSocketProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback((paymentId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Kết nối trực tiếp đến namespace payment
    const newSocket = io('https://api.shopsifu.live/payment', {
      path: '/socket.io',
      query: { paymentId },
      // Cookie sẽ tự động được gửi
      withCredentials: true,
      transports: ['websocket'],
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log(`[WebSocket] Connected to payment namespace with paymentId: ${paymentId}`)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from payment namespace')
      setIsConnected(false)
    })

    // Listen event 'payment' như backend emit
    newSocket.on('payment', (data: PaymentData) => {
      console.log('📨 [WebSocket] Received payment event:', data)
      setPayments((prevPayments) => [...prevPayments, data])
    })

    // Listen event 'receive-money' từ PaymentGateway
    newSocket.on('receive-money', (data: PaymentData) => {
      console.log('💰 [WebSocket] Received money event:', data)
      setPayments((prevPayments) => [...prevPayments, data])
    })

    // Listen for any other payment-related events
    newSocket.onAny((eventName, ...args) => {
      console.log(`🔔 [WebSocket] Received event "${eventName}":`, args)
    })
    
    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message)
      setIsConnected(false)
    })

    socketRef.current = newSocket
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setPayments([])
    }
  }, [])

  // Thêm method để send message
  const sendMoney = useCallback((amount: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-money', amount)
    }
  }, [isConnected])

  const contextValue = {
    payments,
    isConnected,
    connect,
    disconnect,
    sendMoney
  }

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>
}