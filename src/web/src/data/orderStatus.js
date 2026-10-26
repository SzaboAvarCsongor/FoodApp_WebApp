// readable names of the order statuses
export const statusLabels = {
  PENDING: "Új rendelés",
  ACCEPTED: "Elfogadva",
  PREPARING: "Készül",
  READY: "Elkészült",
  DELIVERING: "Úton van",
  DELIVERED: "Kiszállítva",
  CANCELLED: "Lemondva",
};

// what the restaurant can do next from each status
// delivering and delivered belong to the courier (mobile app)
export const nextStep = {
  PENDING: { status: "ACCEPTED", label: "Elfogadás" },
  ACCEPTED: { status: "PREPARING", label: "Készítés indítása" },
  PREPARING: { status: "READY", label: "Elkészült" },
};