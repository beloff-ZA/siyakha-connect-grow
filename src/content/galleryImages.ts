import cabinetBefore from "@/assets/case-franchise-cabinet-before.jpg";
import cabinetAfter from "@/assets/case-franchise-cabinet-after.jpg";
import cleanup1 from "@/assets/case-franchise-cabinet-cleanup-1.jpg";
import cleanup2 from "@/assets/case-franchise-cabinet-cleanup-2.jpg";
import franchiseKfc from "@/assets/case-franchise-kfc.jpg";
import franchiseSignage from "@/assets/case-franchise-digital-signage.jpg";
import franchiseWifi from "@/assets/case-franchise-wifi.jpg";
import exmileCabling from "@/assets/case-exmile-cabling.jpg";
import exmileRack from "@/assets/case-exmile-rack.jpg";
import kwamashu from "@/assets/case-kwamashu-training-room.jpg";
import jhbLab from "@/assets/case-jhb-computer-lab.jpg";
import tasteMoz from "@/assets/case-taste-mozambique.jpg";
import nikitaSite from "@/assets/team-nikita-site-check.png";

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  location?: string;
};

export const galleryImages: GalleryImage[] = [
  { src: cabinetAfter, alt: "Comms cabinet after rebuild", caption: "Rack rebuild — after", location: "Fourways" },
  { src: cabinetBefore, alt: "Comms cabinet before rebuild", caption: "Rack rebuild — before", location: "Fourways" },
  { src: exmileRack, alt: "Structured cabling into switch stack", caption: "Structured cabling", location: "Sandton" },
  { src: franchiseKfc, alt: "Retail store connectivity install", caption: "Franchise rollout", location: "KFC" },
  { src: nikitaSite, alt: "Nikita Jacobs inspecting a labelled patch panel", caption: "Site check", location: "On-site" },
  { src: franchiseWifi, alt: "Wi-Fi access point install", caption: "Guest Wi-Fi rollout", location: "Retail" },
  { src: kwamashu, alt: "Training room computer lab", caption: "Training facility", location: "Kwamashu" },
  { src: jhbLab, alt: "School computer lab install", caption: "Computer lab", location: "Johannesburg" },
  { src: exmileCabling, alt: "Cabling run through building", caption: "Cable tray run", location: "Student accommodation" },
  { src: franchiseSignage, alt: "Digital signage install", caption: "Digital signage", location: "Retail" },
  { src: cleanup1, alt: "Cabinet cleanup in progress", caption: "Rack cleanup", location: "Retail" },
  { src: tasteMoz, alt: "Restaurant AV and CCTV install", caption: "AV & CCTV", location: "Fourways" },
];