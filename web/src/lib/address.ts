export const mainAddress = (alamat: string) => {
  let potong = alamat.split(/No\b|RT\b|RW\b|Blok\b|,|\d/)[0];
  
  potong = potong.replace(/\b(Jl\.?|Jalan)\b/gi, "");
  potong = potong.replace(/\bI+|\d+\b/g, "");

  return potong.replace(/\s+/g, " ").trim();
}