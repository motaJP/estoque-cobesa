"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { StockMovement } from "@/lib/types";
import { ArrowUpRight, ArrowDownLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

function formatDate(timestamp: StockMovement['timestamp']): string {
  if (!timestamp) return 'Data indisponível';
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp as Date;
  }
  return date.toLocaleDateString('pt-BR');
}


export function RecentMovements({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="space-y-4">
      {movements.map((movement) => {
        return (
            <div key={movement.id} className="flex items-center gap-4">
            <Avatar className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {movement.productName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{movement.sku}</p>
            </div>
            <div className="flex flex-col items-end">
                <Badge variant={movement.type === 'Entrada' ? 'secondary' : 'outline'} className={cn("text-xs", movement.type === 'Entrada' ? "text-green-600" : "text-red-600")}>
                    {movement.type === 'Entrada' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownLeft className="mr-1 h-3 w-3" />}
                    {movement.quantity} Unid.
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(movement.timestamp)}
                </p>
            </div>
          </div>
        )
      })}
    </div>
  );
}
