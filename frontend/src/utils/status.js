export const STATUS_MAP = {
  available: "Tillgänglig",
  reserved: "Reserverad",
  rented: "Uthyrd",
  sold: "Såld",
  blocked: "Blockerad",
  draft: "Utkast",
};

export const statusLabel = (value) => STATUS_MAP?.[value] ?? value;

export const statusOptions = Object.entries(STATUS_MAP).map(
  ([value, label]) => ({ value, label }),
);
