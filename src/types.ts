export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Guest" | "Vendor" | "Dual Mode";
  status: "Active" | "Blocked";
  walletBalance: number;
  joinedDate: string;
  panNumber?: string;
  gstin?: string;
  bankAccount?: string;
  bankIFSC?: string;
  kycStatus?: "Pending" | "Approved" | "Rejected" | "Not Submitted";
}

export interface HostApplication {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Vendor" | "Dual Mode" | "Guest";
  panNumber: string;
  gstin: string;
  bankAccount: string;
  bankIFSC: string;
  aadharFront: string | null;
  aadharBack: string | null;
  panCardImage: string | null;
  kycStatus: "Pending" | "Approved" | "Rejected" | "Not Submitted";
  status: "Pending" | "Approved" | "Rejected";
  submittedDate: string;
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
  usedCount?: number;
  usageLimit?: number;
}

export interface Campaign {
  id: string;
  title: string;
  targetGroup: "Guests" | "Vendors" | "All Users";
  channel: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push";
  scheduledTime: string;
  status: "Sent" | "Scheduled" | "Draft" | "Running";
  analytics: {
    sent: number;
    opens: number;
    clicks: number;
    failed?: number;
  };
}

export interface CampaignTemplate {
  id: string;
  name: string;
  type: "email" | "whatsapp" | "push";
  subject?: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TouristAttraction {
  _id: string;
  id: string;
  name: string;
  slug: string;
  state: string;
  city: string;
  image: string;
  coordinates: string;
  lat: number;
  lng: number;
  category: "Nature" | "Adventure" | "Historical" | "Spiritual";
  description: string;
  isActive: boolean;
  popularityScore: number;
  nearbyStaysCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: "Webhook" | "SQS Queue" | "Security" | "System";
  event: string;
  status: "Success" | "Failed" | "Blocked";
  details?: any;
}

export interface DisputeTicket {
  id: string;
  bookingId: string;
  guestName: string;
  hostName: string;
  issue: string;
  amount: number;
  status: "Pending" | "Resolved-Refunded" | "Resolved-PaidVendor";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "Guest" | "Host" | "Admin";
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  guestName: string;
  hostName: string;
  propertyName: string;
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  title: string;
  hostName: string;
  location: string;
  price: number;
  rating: string;
  status: "Active" | "Suspended";
}
