import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Grid3X3, List, Search, SlidersHorizontal, X } from "lucide-react";

interface ProductFiltersProps {
  categories: string[];
  brands: string[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  sortBy: string;
  viewMode: "grid" | "list";
  searchQuery: string;
  onCategoryChange: (category: string | null) => void;
  onBrandChange: (brand: string | null) => void;
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onSearchChange: (query: string) => void;
  productCount: number;
}

const ProductFilters = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  sortBy,
  viewMode,
  searchQuery,
  onCategoryChange,
  onBrandChange,
  onSortChange,
  onViewModeChange,
  onSearchChange,
  productCount,
}: ProductFiltersProps) => {
  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery;

  const clearAllFilters = () => {
    onCategoryChange(null);
    onBrandChange(null);
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Top Bar - Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background hover:bg-secondary text-muted-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background hover:bg-secondary text-muted-foreground"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-secondary/30 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <Select 
          value={selectedCategory || "all"} 
          onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select 
          value={selectedBrand || "all"} 
          onValueChange={(value) => onBrandChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              {selectedCategory}
              <button 
                onClick={() => onCategoryChange(null)}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedBrand && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              {selectedBrand}
              <button 
                onClick={() => onBrandChange(null)}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              "{searchQuery}"
              <button 
                onClick={() => onSearchChange("")}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
