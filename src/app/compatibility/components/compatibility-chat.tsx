"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { getCompatibleParts } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquarePlus, Send, Loader2, Bot, User, Wrench, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";


const initialState = {
  message: null,
  parts: null,
  rationale: null,
  source: null,
};

type Message = {
  id: string;
  sender: "user" | "bot";
  content: React.ReactNode;
};

export function CompatibilityChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      content: "Olá! Sou seu assistente de compatibilidade de peças. Por favor, insira a placa ou o modelo do caminhão que você deseja consultar.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [state, formAction, isPending] = useActionState(getCompatibleParts, initialState);

 useEffect(() => {
    if (state.message && state.parts !== undefined) {
      let botMessage;
      if (state.parts && state.parts.length > 0) {
        botMessage = (
            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Search className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Peças Compatíveis Encontradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Peça</TableHead>
                                <TableHead>Código</TableHead>
                                <TableHead>Fabricante</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.parts.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.partName}</TableCell>
                                        <TableCell>{item.partNumber}</TableCell>
                                        <TableCell>{item.manufacturer}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Fonte & Fundamentação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Fonte: <span className="font-semibold text-foreground">{state.source}</span>.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{state.rationale}</p>
                    </CardContent>
                </Card>
            </div>
        );
      } else if (state.message && state.parts === null) { // Error case
         botMessage = `Desculpe, ocorreu um erro: ${state.message}`;
      } else { // No results case
         botMessage = "Não consegui encontrar peças compatíveis para essa consulta. Você pode tentar um modelo diferente ou verificar a placa.";
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "bot", content: botMessage },
      ]);
    }
  }, [state]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = (formData: FormData) => {
    const query = formData.get("query") as string;
    if (!query.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", content: query },
    ]);
    
    formAction(formData);
    setInput("");
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
           <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 animate-bounce"
            size="icon"
            >
            <Wrench className="h-8 w-8" />
            <span className="sr-only">Abrir Chat de Compatibilidade</span>
           </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="flex items-center gap-2 text-xl">
                <Bot /> Assistente de Compatibilidade
            </SheetTitle>
            <SheetDescription>
                Encontre peças para caminhões usando IA. Digite a placa ou modelo abaixo.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                   {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                  </div>
                  {message.sender === "user" && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>
                            <Bot className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm">Buscando...</span>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form action={handleSendMessage} className="flex items-center gap-2">
              <Input
                name="query"
                placeholder="Digite a placa ou modelo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
