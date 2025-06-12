
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image"; // Added Image import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Search, Edit3, Trash2, Package, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Product } from "@/types";
import { ProductForm } from "@/components/pages/products/product-form";
import { LowStockBadge } from "@/components/pages/products/low-stock-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { useSettings } from "@/contexts/settings-context";
import { useToast, toast } from "@/hooks/use-toast";
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProductInFirestore,
} from "@/services/product-service";

export default function ProductsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { globalLowStockThreshold } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProductData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const firestoreProducts = await getProducts();
      setProducts(firestoreProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load products";
      setError(errorMessage);
      toast({
        title: t("errorLoadingProductsTitle") || "Error Loading Products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditingProduct(null);
      setIsFormOpen(true);
      router.replace('/products', { scroll: false });
    }
  }, [searchParams, router]);
  
  const triggerStockNotification = useCallback((product: Product, previousQuantity?: number) => {
    const effectiveThreshold = product.minStockThreshold ?? globalLowStockThreshold;
    
    const wasAboveThreshold = previousQuantity === undefined || previousQuantity >= effectiveThreshold || previousQuantity <=0;
    const isNowBelowThreshold = effectiveThreshold > 0 && product.quantity < effectiveThreshold && product.quantity > 0;
    const isNowOutOfStock = product.quantity <= 0;

    if (isNowOutOfStock && (previousQuantity === undefined || previousQuantity > 0)) {
        toast({
            title: t("productOutOfStockTitle"),
            description: t("productOutOfStockFull", { name: product.name }),
            variant: "destructive",
            duration: 10000,
        });
    } else if (wasAboveThreshold && isNowBelowThreshold) {
        toast({
            title: t("productLowStockWarning"),
            description: t("productLowStockWarningFull", { name: product.name, quantity: product.quantity }),
            variant: "default",
            duration: 10000,
        });
    }
  }, [globalLowStockThreshold, t, toast]);

  const handleSaveProduct = useCallback(async (
    formData: Omit<Product, "id"> & { minStockThreshold?: number }, 
    id?: string
  ) => {
    try {
      const productBeingEdited = products.find(p => p.id === id);
      const previousQuantity = productBeingEdited?.quantity;

      let savedProductData: Product;
      if (id) { 
        await updateProduct(id, formData);
        savedProductData = { ...productBeingEdited!, ...formData, id };
      } else { 
        const newProduct = await addProduct(formData);
        savedProductData = newProduct;
      }
      
      await fetchProductData(); 
      
      const finalProductState = (await getProducts()).find(p => p.id === savedProductData.id) || savedProductData;
      triggerStockNotification(finalProductState, previousQuantity);

    } catch (error) {
      console.error("Error in handleSaveProduct on page:", error);
      throw error; 
    }
  }, [products, fetchProductData, triggerStockNotification, globalLowStockThreshold, t]);


  const handleDeleteProduct = useCallback(async (productId: string) => {
    const productBeingDeleted = products.find(p => p.id === productId);
    if (!productBeingDeleted) return;

    try {
      await deleteProductInFirestore(productId); 
      toast({
          title: t("productDeletedTitle"),
          description: t("productDeletedDescription", { name: productBeingDeleted.name }),
          variant: "default",
      });
      await fetchProductData(); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: t("errorDeletingProductTitle"),
        description: t("productDeleteError", { error: errorMessage }),
        variant: "destructive",
      });
      console.error("Error deleting product:", error);
    } finally {
      setProductToDelete(null);
    }
  }, [t, fetchProductData, products, toast]);

  const openEditForm = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  }, []);
  
  const openAddForm = useCallback(() => {
    setEditingProduct(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null); 
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-nunito font-bold text-primary">{t("productsTitle")}</h1>
          <Button disabled className="rounded-full"><PlusCircle className="mr-2 h-5 w-5" />{t("productsAddButton")}</Button>
        </div>
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-nunito text-foreground">{t("productsAvailableProducts")}</CardTitle>
              <div className="relative w-full sm:w-1/2 md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("productsSearchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled
                  className="pl-10 rounded-full bg-input border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin my-8" />
            <p className="text-muted-foreground">{t("loadingProducts") || "Loading products..."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
     return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-nunito font-bold text-primary">{t("productsTitle")}</h1>
           <Button onClick={openAddForm} className="rounded-full button-hover-effect"><PlusCircle className="mr-2 h-5 w-5" />{t("productsAddButton")}</Button>
        </div>
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="border-b border-border pb-4 items-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
            <CardTitle className="text-xl font-nunito text-destructive">{t("errorLoadingProductsTitle") || "Error Loading Products"}</CardTitle>
            <div className="mt-2 text-xs text-muted-foreground">Details: {error}</div>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProductData} className="rounded-full button-hover-effect">
              {t("retryButton") || "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-nunito font-bold text-primary">
          {t("productsTitle")}
        </h1>
        <Button onClick={openAddForm} className="rounded-full button-hover-effect">
          <PlusCircle className="mr-2 h-5 w-5" />
          {t("productsAddButton")}
        </Button>
      </div>

      <Card className="shadow-xl rounded-xl">
        <CardHeader className="border-b border-border pb-4">
           <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-nunito text-foreground">{t("productsAvailableProducts")}</CardTitle>
             <div className="relative w-full sm:w-1/2 md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("productsSearchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full bg-input border-border focus:ring-primary" 
                />
              </div>
           </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredProducts.length === 0 ? (
             <div className="text-center py-12">
                <Package className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-2xl font-semibold font-nunito text-foreground">{t("noProductsFound")}</h3>
                <p className="mt-2 text-md text-muted-foreground">
                  {searchTerm ? t("adjustSearchOrFilter") : t("addNewProductToGetStarted")}
                </p>
                {!searchTerm && (
                  <Button onClick={openAddForm} className="mt-6 rounded-full button-hover-effect">
                    <PlusCircle className="mr-2 h-5 w-5" /> {t("productsAddButton")}
                  </Button>
                )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-[60px] text-muted-foreground">{t("productTableThumb")}</TableHead>
                  <TableHead className="text-muted-foreground">{t("productTableName")}</TableHead>
                  <TableHead className="hidden md:table-cell text-muted-foreground">{t("productTableCategory")}</TableHead>
                  <TableHead className="text-right text-muted-foreground">{t("productTablePrice")}</TableHead>
                  <TableHead className="text-center text-muted-foreground">{t("productTableQuantity")}</TableHead>
                  <TableHead className="text-right text-muted-foreground">{t("productTableActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <Image
                        src={`https://placehold.co/64x64.png?text=${product.name.charAt(0).toUpperCase()}`}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md aspect-square object-cover"
                        data-ai-hint="product item"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-right text-foreground">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <LowStockBadge quantity={product.quantity} threshold={product.minStockThreshold ?? globalLowStockThreshold} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(product)} className="mr-2 hover:text-primary rounded-full">
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">{t("productEdit")}</span>
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)} className="hover:text-destructive rounded-full">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("productDelete")}</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleCloseForm(); else setIsFormOpen(true); }}>
        <DialogContent className="sm:max-w-lg rounded-xl bg-card border-border">
          <ProductForm
            key={editingProduct ? editingProduct.id : 'new-product-form'}
            product={editingProduct}
            onSave={handleSaveProduct}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent className="rounded-xl bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-nunito text-primary">{t("confirmDeleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t("confirmDeleteDescription")} <br/>
                Product: <strong className="text-foreground">{productToDelete.name}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)} className="rounded-full">
                {t("cancelButton")}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteProduct(productToDelete.id)} 
                className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("deleteButton")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
