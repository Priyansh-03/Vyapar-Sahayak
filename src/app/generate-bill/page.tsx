
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { KeyboardEvent } from 'react'; // Import KeyboardEvent
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ShoppingCart, FileOutput, AlertTriangle, Loader2, User, CalendarDays, Clock, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Product, CartItem, Bill } from "@/types";
import { ProductSearchItem } from "@/components/pages/generate-bill/product-search-item";
import { CartItemCard } from "@/components/pages/generate-bill/cart-item";
import { BillSummaryDialog } from "@/components/pages/generate-bill/bill-summary-dialog";
import { useSettings } from "@/contexts/settings-context";
import { useToast, toast } from "@/hooks/use-toast";
import { getProducts, updateProductQuantities } from "@/services/product-service";
import { addBillToFirestore, getNextBillNumber } from "@/services/bill-service";
import { format } from "date-fns";


export default function GenerateBillPage() {
  const { t } = useTranslation();
  const { globalLowStockThreshold } = useSettings();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [isBillSummaryOpen, setIsBillSummaryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProductsForBilling = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const firestoreProducts = await getProducts();
      setAvailableProducts(firestoreProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load products";
      setProductError(errorMessage);
      toast({
        title: t("errorLoadingProductsTitle") || "Error Loading Products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [t]); // Removed toast from deps as it's stable

  useEffect(() => {
    fetchProductsForBilling();
  }, [fetchProductsForBilling]);


  const filteredProducts = useMemo(() => {
    return availableProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !cart.find(item => item.id === product.id) &&
        product.quantity > 0
    );
  }, [availableProducts, searchTerm, cart]);

  const addToCart = useCallback((product: Product) => {
    const productInStore = availableProducts.find(p => p.id === product.id);
    if (!productInStore || productInStore.quantity <= 0) {
      toast({
        title: t("productOutOfStockTitle"),
        description: t("productOutOfStockFull", { name: product.name }),
        variant: "destructive"
      });
      return;
    }
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.cartQuantity < productInStore.quantity) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
          );
        } else {
          toast({
              title: t("maxQuantityReachedTitle"),
              description: t("cannotAddMoreThanStock", {name: product.name}),
              variant: "default"
          });
          return prevCart;
        }
      }
      return [...prevCart, { ...productInStore, cartQuantity: 1 }];
    });
  }, [t, availableProducts]); // Removed toast from deps

  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const productInStore = availableProducts.find(p => p.id === productId);
          const maxStock = productInStore ? productInStore.quantity : item.quantity;

          if (newQuantity < 0) return { ...item, cartQuantity: 0 };
          if (newQuantity > maxStock) {
            toast({
                title: t("maxQuantityReachedTitle"),
                description: t("cannotAddMoreThanStock", {name: item.name}),
                variant: "default"
            });
            return { ...item, cartQuantity: maxStock };
          }
          return { ...item, cartQuantity: newQuantity };
        }
        return item;
      }).filter(item => item.cartQuantity > 0)
    );
  }, [t, availableProducts]); // Removed toast from deps

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const grandTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  }, [cart]);

  const triggerStockNotificationAfterSale = useCallback((productId: string, newQuantity: number, productName: string, minStock?: number) => {
    const effectiveThreshold = minStock ?? globalLowStockThreshold;
    
    if (newQuantity <= 0) {
        toast({
            title: t("productOutOfStockTitle"),
            description: t("productOutOfStockFull", { name: productName }),
            variant: "destructive",
            duration: 10000,
        });
    } else if (effectiveThreshold > 0 && newQuantity < effectiveThreshold) {
        toast({
            title: t("productLowStockWarning"),
            description: t("productLowStockWarningFull", { name: productName, quantity: newQuantity }),
            variant: "default",
            duration: 10000,
        });
    }
  }, [globalLowStockThreshold, t]); // Removed toast from deps


  const handleGenerateBill = useCallback(async () => {
    // 1. Check for empty cart
    if (cart.length === 0) {
      toast({
        title: t("emptyCartTitle"),
        description: t("emptyCartDescription"),
        variant: "destructive"
      });
      return; // Exit if cart is empty
    }

    const trimmedCustomerPhoneNumber = customerPhoneNumber.trim();

    // 2. Validate phone number
    // If a phone number is provided AND it's not 10 digits long, it's an error.
    if (trimmedCustomerPhoneNumber.length > 0 && trimmedCustomerPhoneNumber.length !== 10) {
      const errorMsg = t("phoneNumberInvalidLengthDescription");
      setPhoneNumberError(errorMsg); // Set on-screen error
      toast({ // Show toast
        title: t("phoneNumberInvalidLengthTitle"),
        description: errorMsg,
        variant: "destructive"
      });
      return; // CRITICAL: Exit immediately if invalid phone number is provided
    } else {
      // Phone number is either empty or it is 10 digits long (valid).
      // Clear any previous on-screen error message.
      if (phoneNumberError) {
        setPhoneNumberError(null);
      }
    }

    // 3. If we've reached this point, all pre-checks have passed.
    // Cart is not empty, and phone number (if provided) is valid.
    // Proceed with bill generation.
    setIsGenerating(true);
    try {
      const billTimestamp = new Date();
      const billNumberString = await getNextBillNumber(); 

      const newBill: Bill = {
        id: String(Date.now()), 
        billNumber: billNumberString,
        customerName: customerName.trim() || undefined,
        customerPhoneNumber: trimmedCustomerPhoneNumber || undefined, // Use the validated trimmed number
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity,
          subtotal: item.price * item.cartQuantity,
        })),
        totalAmount: grandTotal,
        timestamp: billTimestamp,
      };

      const quantityUpdates = cart.map(cartItem => {
        const productInStore = availableProducts.find(p => p.id === cartItem.id);
        const currentQuantity = productInStore ? productInStore.quantity : 0;
        return {
          id: cartItem.id,
          newQuantity: currentQuantity - cartItem.cartQuantity,
        };
      });

      await updateProductQuantities(quantityUpdates);
      await addBillToFirestore(newBill);
      
      const updatedProductsList = await getProducts();
      setAvailableProducts(updatedProductsList); 

      quantityUpdates.forEach(update => {
        const updatedProduct = updatedProductsList.find(p => p.id === update.id);
        if (updatedProduct) {
          triggerStockNotificationAfterSale(updatedProduct.id, updatedProduct.quantity, updatedProduct.name, updatedProduct.minStockThreshold);
        }
      });
      
      setGeneratedBill(newBill);
      setCart([]); 
      setCustomerName(""); 
      setCustomerPhoneNumber(""); 
      // setPhoneNumberError(null); // Already cleared above if valid or empty
      setIsBillSummaryOpen(true); 
      toast({
        title: t("billGeneratedToastTitle"),
        description: t("billGeneratedToastDescription", {billNumber: newBill.billNumber}),
        variant: "default",
        duration: 7000
      });

    } catch (error) {
      console.error("Error generating bill, updating stock, or saving bill:", error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      toast({
        title: t("errorGeneratingBillTitle"),
        description: t("errorGeneratingBillDescription", { error: errorMessage }),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    cart, 
    customerPhoneNumber, 
    phoneNumberError, 
    setPhoneNumberError, 
    t, 
    customerName, 
    grandTotal, 
    availableProducts, 
    triggerStockNotificationAfterSale,
    // State setters for cart, customerName etc. are stable
  ]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    setCustomerPhoneNumber(numericValue.slice(0, 10));
    if (phoneNumberError) { 
        setPhoneNumberError(null);
    }
  };

  const handlePhoneNumberKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey, metaKey } = e;
    
    if (
      /^[0-9]$/.test(key) || 
      [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End"
      ].includes(key) ||
      (metaKey && key.toLowerCase() === 'a') || 
      (ctrlKey && key.toLowerCase() === 'a') || 
      (metaKey && key.toLowerCase() === 'c') || 
      (ctrlKey && key.toLowerCase() === 'c') || 
      (metaKey && key.toLowerCase() === 'v') || 
      (ctrlKey && key.toLowerCase() === 'v') || 
      (metaKey && key.toLowerCase() === 'x') || 
      (ctrlKey && key.toLowerCase() === 'x') || 
      (metaKey && key.toLowerCase() === 'z') || 
      (ctrlKey && key.toLowerCase() === 'z') 
    ) {
      return;
    }
    e.preventDefault();
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
      <Card className="lg:w-2/5 shadow-xl flex flex-col rounded-xl bg-card border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-nunito text-primary">{t("generateBillAvailableProducts")}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("productsSearchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full bg-input border-border focus:ring-primary"
              disabled={isLoadingProducts}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-grow p-4 pt-0">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center h-full py-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : productError ? (
            <div className="text-center py-10">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
              <p className="text-destructive">{t("errorLoadingProductsTitle")}</p>
              <p className="text-sm text-muted-foreground mb-3">{productError}</p>
              <Button onClick={fetchProductsForBilling} variant="outline" size="sm" className="rounded-full">
                {t("retryButton") || "Retry"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductSearchItem key={product.id} product={product} onAddToCart={addToCart} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm ? t("noProductsMatchYourSearch") : t("searchForProductsToAdd")}
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </Card>

      <Card className="lg:w-3/5 shadow-xl flex flex-col rounded-xl bg-card border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-nunito text-primary flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" /> {t("generateBillCartTitle")}
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-3">
            <div>
                <Label htmlFor="customerName" className="text-xs text-muted-foreground flex items-center mb-1">
                    <User className="mr-1.5 h-3.5 w-3.5"/>{t("billCustomerNameLabel")} ({t("optionalText")})
                </Label>
                <Input
                    id="customerName"
                    type="text"
                    placeholder={t("billCustomerNamePlaceholder")}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-lg bg-input border-border focus:ring-primary h-9 text-sm"
                />
            </div>
            <div>
                <Label htmlFor="customerPhoneNumber" className="text-xs text-muted-foreground flex items-center mb-1">
                    <Phone className="mr-1.5 h-3.5 w-3.5"/>{t("billCustomerPhoneLabel")} ({t("optionalText")})
                </Label>
                <Input
                    id="customerPhoneNumber"
                    type="tel" 
                    placeholder={t("billCustomerPhonePlaceholder")}
                    value={customerPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    onKeyDown={handlePhoneNumberKeyDown}
                    className="rounded-lg bg-input border-border focus:ring-primary h-9 text-sm"
                    maxLength={10} 
                />
                {phoneNumberError && (
                    <p className="text-xs text-destructive mt-1">{phoneNumberError}</p>
                )}
            </div>
            <div>
                <Label className="text-xs text-muted-foreground flex items-center mb-1">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5"/>{t("billDateLabel")}
                </Label>
                <Input
                    type="text"
                    value={format(currentDateTime, "dd/MM/yyyy")}
                    readOnly
                    className="rounded-lg bg-muted/50 border-border h-9 text-sm text-foreground cursor-default"
                />
            </div>
            <div>
                <Label className="text-xs text-muted-foreground flex items-center mb-1">
                    <Clock className="mr-1.5 h-3.5 w-3.5"/>{t("billTimeLabel")}
                </Label>
                 <Input
                    type="text"
                    value={format(currentDateTime, "hh:mm:ss a")}
                    readOnly
                    className="rounded-lg bg-muted/50 border-border h-9 text-sm text-foreground cursor-default"
                />
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-grow p-4 pt-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("generateBillCartEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {cart.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeFromCart}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <CardFooter className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="w-full flex justify-between items-center text-lg font-semibold text-foreground">
            <span>{t("generateBillGrandTotal", {total: ''}).replace(': ₹{total}', '')}</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <Button 
            size="lg" 
            className="w-full font-semibold text-base rounded-full button-hover-effect"
            onClick={handleGenerateBill} 
            disabled={cart.length === 0 || isGenerating || isLoadingProducts}
          >
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileOutput className="mr-2 h-5 w-5" />}
            {isGenerating ? t("generateBillGeneratingButton") : t("generateBillButton")}
          </Button>
        </CardFooter>
      </Card>

      <BillSummaryDialog
        bill={generatedBill}
        isOpen={isBillSummaryOpen}
        onClose={() => setIsBillSummaryOpen(false)}
      />
    </div>
  );
}
    
