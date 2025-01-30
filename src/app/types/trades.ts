export interface Trade {
  friendId: string;
  cardToTrade: string; // e.g. "packs/Genetic Apex A1/1"
  cardToReceive: string; // e.g. "packs/Genetic Apex A1/1"
  timestamp: string; // ISO string for sorting
  message: string; // Optional message for the trade
}

export interface Trades {
  proposed: Trade[]; // Trades proposed by this user
  requests: Trade[]; // Trade requests received from others
}

export interface UserDocument {
  friendCode: string | null;
  cardsForTrade: string[]; // Array of card paths e.g. ["packs/Genetic Apex A1/1", "packs/Genetic Apex A1/2"]
  wishlist: string[]; // Array of card paths e.g. ["packs/Genetic Apex A1/1", "packs/Genetic Apex A1/2"]
  trades: Trades;
}
