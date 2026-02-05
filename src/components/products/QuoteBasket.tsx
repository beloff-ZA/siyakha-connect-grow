import { useQuoteBasket } from "@/contexts/QuoteBasketContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Wrench, 
  MessageCircle,
  Package,
  ArrowRight,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const QuoteBasket = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    toggleInstallation, 
    clearBasket, 
    getTotal,
    itemCount,
    isOpen,
    setIsOpen
  } = useQuoteBasket();

  const { subtotal, installation, total } = getTotal();

  const generateWhatsAppMessage = () => {
    let message = "Hi, I'd like to request a quote for:\n\n";
    
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} (${item.sku}) - R${(item.price * item.quantity).toLocaleString()}`;
      if (item.includeInstallation) {
        message += ` + Installation`;
      }
      message += "\n";
    });

    message += `\n📦 Products: R${subtotal.toLocaleString()}`;
    if (installation > 0) {
      message += `\n🔧 Installation: R${installation.toLocaleString()}`;
    }
    message += `\n💰 Estimated Total: R${total.toLocaleString()}`;
    message += "\n\nPlease provide a formal quotation.";

    return encodeURIComponent(message);
  };

  const handleSendQuote = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/27815012993?text=${message}`, "_blank");
    toast.success("Opening WhatsApp with your quote request");
  };

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:right-6 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="Open quote basket"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-[1.5rem] h-6 flex items-center justify-center">
            {itemCount}
          </Badge>
        )}
      </button>

      {/* Basket Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Quote Basket
                {itemCount > 0 && (
                  <Badge variant="secondary">{itemCount} items</Badge>
                )}
              </SheetTitle>
            </div>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 bg-secondary/50 rounded-full mb-4">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Your basket is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add products to get a combined quote
              </p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-20 h-20 bg-background rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">
                            {item.name}
                          </h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.sku}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 bg-background rounded-lg border border-border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-secondary transition-colors rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-secondary transition-colors rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-semibold text-primary">
                            R{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Installation Toggle */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={item.includeInstallation}
                            onCheckedChange={() => toggleInstallation(item.id)}
                          />
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">Add Installation</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          +R{(item.installationPrice * item.quantity).toLocaleString()}
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        Professional installation per unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Products ({itemCount})</span>
                    <span className="font-medium">R{subtotal.toLocaleString()}</span>
                  </div>
                  {installation > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" />
                        Installation
                      </span>
                      <span className="font-medium">R{installation.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary">
                    R{total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Final pricing subject to site assessment. VAT included.
                </p>
              </div>

              {/* Actions */}
              <SheetFooter className="flex-col gap-2 pt-4 border-t border-border mt-4">
                <Button 
                  size="lg" 
                  className="w-full cta-primary gap-2"
                  onClick={handleSendQuote}
                >
                  <MessageCircle className="w-4 h-4" />
                  Request Quote via WhatsApp
                </Button>
                <Link to="/contact#quote-form" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    Request Formal Quote
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearBasket}
                  className="text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Basket
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default QuoteBasket;
