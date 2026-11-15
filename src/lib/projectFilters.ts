export function inferClientType(industry: string): string {
  const i = industry.toLowerCase();
  if (i.includes("beauty") || i.includes("wellness")) return "Beauty & Wellness";
  if (i.includes("automotive")) return "Automotive";
  if (i.includes("event") || i.includes("conference")) return "Events";
  if (i.includes("mining")) return "Mining";
  if (i.includes("healthcare")) return "Healthcare";
  if (i.includes("hospitality") || i.includes("restaurant")) return "Hospitality";
  if (i.includes("retail") || i.includes("franchise")) return "Retail";
  if (i.includes("school") || i.includes("training") || i.includes("education")) return "Education";
  if (i.includes("student")) return "Student Accommodation";
  if (i.includes("estate") || i.includes("residential")) return "Estates";
  if (i.includes("government") || i.includes("border")) return "Government";
  return "Commercial";
}

export function inferRegion(location: string): string {
  const l = location.trim().toLowerCase();
  if (!l) return "";
  if (l.includes("dubai") || l.includes("riyadh") || l.includes("doha") || l.includes("uae") || l.includes("qatar") || l.includes("saudi")) return "GCC";
  if (l.includes("london") || l.includes("uk")) return "UK";
  return "South Africa";
}