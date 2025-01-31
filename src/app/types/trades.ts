export interface Trade {
  friendId: string;
  cardToTrade: string; // e.g. "genetic-apex-a1-1"
  cardToReceive: string; // e.g. "genetic-apex-a1-1"
  timestamp: string; // ISO string for sorting
  message: string; // Optional message for the trade
}

export interface Trades {
  proposed: Trade[]; // Trades proposed by this user
  requests: Trade[]; // Trade requests received from others
}

export interface UserDocument {
  "friend-code": string | null;
  "available-to-trade": string[];
  wishlist: string[];
  trades: {
    proposed: Trade[];
    requests: Trade[];
  };
}
