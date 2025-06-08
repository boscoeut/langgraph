import { useState, useEffect } from "react"
import { ChatMessage } from "./components/ChatMessage"
import { ChatInput } from "./components/ChatInput"
import { AgentSelector } from "./components/AgentSelector"
import { AgentEditor } from "./components/AgentEditor"
import { processMessage as chatAgentProcessMessage } from "./lib/langgraph/chatAgent"
import { processMessage as baseAgentProcessMessage } from "./lib/langgraph/baseAgent"
import { Allotment } from "allotment"
import { initializePython, testPythonOutput } from "./services/pythonService"
import "allotment/dist/style.css"

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
  const [pythonError, setPythonError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Python environment
    initializePython().catch(error => {
      console.error('Failed to initialize Python:', error);
      setPythonError('Failed to initialize Python environment. Some features may not work.');
    });
  }, []);

  const handleTestPython = async () => {
    try {
      const output = await testPythonOutput();
      // Add the output as a message
      const testMessage: Message = {
        id: Date.now().toString(),
        content: `Python Test Output:\n${output}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error("Python test failed:", error);
      setPythonError("Python test failed. Check console for details.");
    }
  };

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
      <div className="container mx-auto max-w-6xl h-screen flex flex-col">
        <header className="py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">LangGraph Chat</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleTestPython}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Python
            </button>
            <AgentSelector 
              selectedAgent={selectedAgent}
              onAgentChange={setSelectedAgent}
            />
          </div>
        </header>
        
        {pythonError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Warning</p>
            <p>{pythonError}</p>
          </div>
        )}
        
        <div className="flex-1">
          <Allotment>
            <Allotment.Pane minSize={300}>
              <div className="h-full flex flex-col">
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
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <AgentEditor selectedAgent={selectedAgent} />
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>
    </div>
  )
}

export default App
