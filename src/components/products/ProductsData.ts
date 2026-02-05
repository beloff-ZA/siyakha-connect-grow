import { Camera, Sun, Wifi, Shield, Smartphone, Eye, Volume2, HardDrive, Battery } from "lucide-react";
import { Product } from "./ProductCard";

export const products: Product[] = [
  {
    id: "tp-tapo-c660-kit",
    name: "TP-Link Tapo C660 Solar-Powered Pan/Tilt Security Camera Kit",
    sku: "TP-TAPO-C660-KIT",
    price: 2875,
    image: "/lovable-uploads/tapo-c660-product.png",
    boxImage: "/lovable-uploads/tapo-c660-box.png",
    description: "The Tapo C660 delivers 4K 8MP ultra-clear video with 18× digital zoom and full 360° pan/tilt coverage, ensuring no detail is missed. Built-in AI smart detection accurately identifies people, pets, and vehicles, reducing false alerts.",
    features: [
      { icon: Camera, text: "4K 8MP Video" },
      { icon: Eye, text: "360° Pan/Tilt" },
      { icon: Sun, text: "Solar Powered" },
      { icon: Shield, text: "AI Detection" },
      { icon: Wifi, text: "Dual-Band Wi-Fi" },
      { icon: Smartphone, text: "App Control" },
    ],
    highlights: [
      "18× digital zoom for detailed monitoring",
      "Starlight color night vision with F1.6 lens",
      "Built-in spotlights for vivid low-light imaging",
      "Maintenance-free solar power for off-grid locations",
      "Free Person/Pet/Vehicle detection",
      "Privacy mode & encrypted local storage",
    ],
    category: "Security Cameras",
    brand: "TP-Link",
    warranty: "2 Year",
    inStock: true,
    rating: 4.7,
    reviewCount: 24,
  },
  {
    id: "tp-tapo-c460-kit",
    name: "TP-Link Tapo 4K 8MP Solar Security Camera Kit | C460",
    sku: "TP-TAPO-C460-KIT",
    manufacturerSku: "Tapo C460 KIT",
    price: 2548.79,
    image: "/lovable-uploads/tapo-c460-product.png",
    boxImage: "/lovable-uploads/tapo-c460-mounted.png",
    description: "The TP-Link Tapo C460 is a 4K 8MP solar-powered security camera kit designed for outdoor surveillance. It provides ultra-high-definition video and includes a solar panel and high-capacity battery for continuous, maintenance-free operation.",
    features: [
      { icon: Camera, text: "4K 8MP Video" },
      { icon: Sun, text: "Solar Panel" },
      { icon: Battery, text: "High-Capacity Battery" },
      { icon: Shield, text: "Motion Detection" },
      { icon: Volume2, text: "Two-Way Audio" },
      { icon: HardDrive, text: "Local/Cloud Storage" },
    ],
    highlights: [
      "Full-colour night vision day and night",
      "Intelligent motion detection for people, vehicles and pets",
      "Two-way audio communication",
      "Smart notifications to your device",
      "Local or cloud storage options",
      "Tapo app for remote viewing and control",
    ],
    category: "Security Cameras",
    brand: "TP-Link",
    warranty: "2 Year",
    inStock: true,
    rating: 4.5,
    reviewCount: 18,
  },
];

export const getCategories = (): string[] => {
  return [...new Set(products.map(p => p.category))];
};

export const getBrands = (): string[] => {
  return [...new Set(products.map(p => p.brand))];
};
