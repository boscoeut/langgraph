import { cn } from "../lib/utils"

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp: string
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] rounded-lg px-4 py-2",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <div className="flex flex-col">
          <p className="text-sm">{message}</p>
          <span className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  )
} 