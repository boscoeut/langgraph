import { useState } from "react"
import { cn } from "../lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className={cn(
          "flex-1 px-4 py-2 rounded-md border bg-background",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className={cn(
          "px-4 py-2 rounded-md bg-primary text-primary-foreground",
          "hover:bg-primary/90 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Send
      </button>
    </form>
  )
} 