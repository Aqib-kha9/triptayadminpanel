export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Guest" | "Vendor" | "Dual Mode";
  status: "Active" | "Blocked";
  walletBalance: number;
  joinedDate: string;
}

export interface HostApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  location: string;
  type: "Stay" | "Activity";
  category?: string; // Adventure, Trekking, Farming, Experiences
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  priceExpected: number;
  panNumber: string;
  gstin: string;
  bankAccount: string;
  bankIFSC: string;
}

export interface Property {
  id: string;
  title: string;
  hostName: string;
  location: string;
  type: "Stay" | "Activity";
  category?: string;
  price: number;
  rating: string;
  status: "Active" | "Suspended";
  breakfastPrice?: number;
  dinnerPrice?: number;
  parkingAvailable?: boolean;
}

export interface SystemBooking {
  id: string;
  guestName: string;
  propertyName: string;
  hostName: string;
  amount: number;
  date: string;
  status: "Completed" | "Upcoming" | "Cancelled";
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  type: "Global" | "Stay-Specific" | "Activity-Specific";
  targetName: string;
  expiryDate: string;
  status: "Active" | "Expired";
}

export interface Campaign {
  id: string;
  title: string;
  targetGroup: "Guests" | "Vendors" | "All Users";
  channel: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push";
  scheduledTime: string;
  status: "Sent" | "Scheduled" | "Draft";
  analytics: {
    sent: number;
    opens: number;
    clicks: number;
  };
}

export interface TouristAttraction {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  nearbyStaysCount: number;
  category: "Nature" | "Adventure" | "Historical" | "Spiritual";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: "Webhook" | "SQS Queue" | "Security" | "System";
  event: string;
  status: "Success" | "Failed" | "Blocked";
}
