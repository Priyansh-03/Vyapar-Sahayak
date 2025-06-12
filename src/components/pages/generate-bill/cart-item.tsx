
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/types";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(e.target.value, 10);
    if (isNaN(newQuantity) || newQuantity < 0) newQuantity = 0;
    if (newQuantity > item.quantity) newQuantity = item.quantity; 
    onUpdateQuantity(item.id, newQuantity);
  };

  const incrementQuantity = () => {
    if (item.cartQuantity < item.quantity) {
      onUpdateQuantity(item.id, item.cartQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (item.cartQuantity > 0) {
      onUpdateQuantity(item.id, item.cartQuantity - 1);
    }
  };


  return (
    <div className="flex items-center justify-between p-3 bg-background/70 rounded-lg border border-border gap-2 shadow-sm">
      <Image
        src={`https://placehold.co/64x64.png?text=${item.name.charAt(0).toUpperCase()}`}
        alt={item.name}
        width={40}
        height={40}
        className="rounded-md aspect-square object-cover"
        data-ai-hint="product item"
      />
      <div className="flex-grow overflow-hidden">
        <h4 className="font-medium text-sm truncate text-foreground" title={item.name}>{item.name}</h4>
        <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={item.cartQuantity <= 0} className="h-7 w-7 text-muted-foreground hover:text-primary">
          <MinusCircle className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.cartQuantity}
          onChange={handleQuantityChange}
          min={0}
          max={item.quantity}
          className="h-8 w-12 text-center px-1 bg-input border-border focus:ring-primary text-foreground"
        />
        <Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={item.cartQuantity >= item.quantity} className="h-7 w-7 text-muted-foreground hover:text-primary">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm font-medium w-16 text-right shrink-0 text-foreground">₹{(item.price * item.cartQuantity).toFixed(2)}</p>
      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="text-destructive hover:text-destructive/80 h-7 w-7">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
