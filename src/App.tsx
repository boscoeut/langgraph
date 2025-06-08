import { useState } from "react"
import { ChatMessage } from "./components/ChatMessage"
import { ChatInput } from "./components/ChatInput"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // TODO: Add LangGraph integration here
    // For now, we'll just simulate a response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated response. LangGraph integration coming soon!",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        <header className="py-4 border-b">
          <h1 className="text-2xl font-bold text-foreground">LangGraph Chat</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default App
