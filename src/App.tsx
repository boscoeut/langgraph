import { useState } from "react"
import { ChatMessage } from "./components/ChatMessage"
import { ChatInput } from "./components/ChatInput"
import { AgentSelector } from "./components/AgentSelector"
import { processMessage as chatAgentProcessMessage } from "./lib/langgraph/chatAgent"
import { processMessage as baseAgentProcessMessage } from "./lib/langgraph/baseAgent"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("chatAgent")

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

    try {
      // Process the message using LangGraph
      let response: any
      console.log("selectedAgent", selectedAgent)
      if (selectedAgent === "chatAgent") {
        response = await chatAgentProcessMessage(content)
      } else {
        response = await baseAgentProcessMessage(content)
      }
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response[response.length - 1]?.content || "Sorry, I couldn't process your message.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error processing message:", error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your message.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        <header className="py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">LangGraph Chat</h1>
          <AgentSelector 
            selectedAgent={selectedAgent}
            onAgentChange={setSelectedAgent}
          />
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
