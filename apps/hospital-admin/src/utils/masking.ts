/**
 * Mask email address for privacy and PII protection.
 * Examples:
 * - rahul.sharma@example.com -> r**********a@e*****e.com
 * - admin@hospital.org -> a***n@h******l.org
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email || typeof email !== "string") return "—";
  const cleanEmail = email.trim();
  if (!cleanEmail.includes("@")) return "*****";

  const [localPart, domainPart] = cleanEmail.split("@");
  if (!localPart || !domainPart) return "*****";

  const maskedLocal =
    localPart.length <= 2
      ? localPart[0] + "***"
      : localPart[0] + "*".repeat(Math.max(localPart.length - 2, 3)) + localPart[localPart.length - 1];

  const domainParts = domainPart.split(".");
  const mainDomain = domainParts[0];
  const tld = domainParts.slice(1).join(".");

  const maskedDomain =
    mainDomain.length <= 2
      ? mainDomain[0] + "***"
      : mainDomain[0] + "*".repeat(Math.max(mainDomain.length - 2, 2)) + mainDomain[mainDomain.length - 1];

  return `${maskedLocal}@${maskedDomain}${tld ? "." + tld : ""}`;
}

/**
 * Mask phone / contact number for privacy and PII protection.
 * Examples:
 * - +91 9876543210 -> +91 98*****210
 * - 9876543210 -> 98*****210
 * - +1 (555) 019-2834 -> +1 01*****834
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone || typeof phone !== "string") return "—";
  const cleanPhone = phone.trim();
  if (cleanPhone.length < 5) return "*****";

  const digits = cleanPhone.replace(/\D/g, "");
  if (digits.length <= 4) return "*****";

  const firstDigits = digits.slice(0, 2);
  const lastDigits = digits.slice(-3);
  const maskedMiddle = "*".repeat(Math.max(digits.length - 5, 4));

  if (cleanPhone.startsWith("+")) {
    const countryCode = cleanPhone.split(" ")[0] || "+91";
    return `${countryCode} ${firstDigits}${maskedMiddle}${lastDigits}`;
  }

  return `${firstDigits}${maskedMiddle}${lastDigits}`;
}
