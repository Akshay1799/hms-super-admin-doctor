export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row).map(val => {
      let str = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val);
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
