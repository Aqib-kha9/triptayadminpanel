import type {
  PlatformUser,
  HostApplication,
  Property,
  SystemBooking,
  Coupon,
  Campaign,
  TouristAttraction,
  AuditLog
} from "../types";

export const INITIAL_USERS: PlatformUser[] = [
  { id: "USR-001", name: "Meera Kapoor", email: "meera.k@example.com", phone: "+91 98123 45678", role: "Dual Mode", status: "Active", walletBalance: 4500, joinedDate: "12 January, 2026" },
  { id: "USR-002", name: "Anuj Sharma", email: "anuj.sharma@example.com", phone: "+91 99112 23344", role: "Guest", status: "Active", walletBalance: 1200, joinedDate: "05 February, 2026" },
  { id: "USR-003", name: "Karan Singh", email: "karan.singh@example.com", phone: "+91 98765 12345", role: "Vendor", status: "Active", walletBalance: 0, joinedDate: "15 May, 2026" },
  { id: "USR-004", name: "Kabir Roy", email: "kabir.roy@example.com", phone: "+91 90909 09090", role: "Guest", status: "Blocked", walletBalance: 250, joinedDate: "10 March, 2026" },
  { id: "USR-005", name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 88877 66554", role: "Dual Mode", status: "Active", walletBalance: 8000, joinedDate: "01 April, 2026" }
];

export const INITIAL_APPLICATIONS: HostApplication[] = [
  {
    id: "APP-9012",
    name: "Aryan Singh",
    email: "aryan.singh@example.com",
    phone: "+91 98765 43210",
    property: "The Creek Villa: A Riverside Sanctuary",
    location: "Manali, HP",
    type: "Stay",
    submittedDate: "Today, 04:30 AM",
    status: "Pending",
    priceExpected: 4500,
    panNumber: "ABCDE1234F",
    gstin: "02ABCDE1234F1Z4",
    bankAccount: "987654321098 (State Bank of India)",
    bankIFSC: "SBIN0001234"
  },
  {
    id: "APP-9011",
    name: "Sneha Reddy",
    email: "sneha.r@example.com",
    phone: "+91 88877 66554",
    property: "Mountain View Cottage",
    location: "Rishikesh, UK",
    type: "Stay",
    submittedDate: "Yesterday",
    status: "Pending",
    priceExpected: 3200,
    panNumber: "WXYZP9876Q",
    gstin: "05WXYZP9876Q1Z3",
    bankAccount: "554433221100 (HDFC Bank)",
    bankIFSC: "HDFC0000888"
  },
  {
    id: "APP-9010",
    name: "Rakesh Negi",
    email: "rakesh.negi@example.com",
    phone: "+91 99887 76655",
    property: "Ganga River Rafting Adventure",
    location: "Rishikesh, UK",
    type: "Activity",
    category: "Adventure",
    submittedDate: "16 May, 2026",
    status: "Approved",
    priceExpected: 1200,
    panNumber: "KLMNP5544R",
    gstin: "05KLMNP5544R1Z2",
    bankAccount: "112233445566 (ICICI Bank)",
    bankIFSC: "ICIC0000104"
  },
  {
    id: "APP-9009",
    name: "Vikram Rathore",
    email: "vikram.r@example.com",
    phone: "+91 88776 65544",
    property: "Jodhpur Desert Jeeping Adventure",
    location: "Jodhpur, RJ",
    type: "Activity",
    category: "Adventure",
    submittedDate: "12 May, 2026",
    status: "Rejected",
    priceExpected: 800,
    panNumber: "EPVPN1123P",
    gstin: "08EPVPN1123P1Z5",
    bankAccount: "123456789012 (Punjab National Bank)",
    bankIFSC: "PUNB0012345"
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  { id: "PROP-001", title: "The Creek Villa: A Riverside Sanctuary", hostName: "Aryan Singh", location: "Manali, HP", type: "Stay", price: 4500, rating: "4.9", status: "Active", breakfastPrice: 350, dinnerPrice: 650, parkingAvailable: true },
  { id: "PROP-002", title: "Mountain View Cottage", hostName: "Sneha Reddy", location: "Rishikesh, UK", type: "Stay", price: 3200, rating: "4.7", status: "Active", breakfastPrice: 250, dinnerPrice: 500, parkingAvailable: true },
  { id: "PROP-003", title: "Ganga River Rafting Adventure", hostName: "Rakesh Negi", location: "Rishikesh, UK", type: "Activity", category: "Adventure", price: 1200, rating: "4.8", status: "Active" },
  { id: "PROP-004", title: "Paragliding Joyride & Camp", hostName: "Amit Thakur", location: "Bir Billing, HP", type: "Activity", category: "Adventure", price: 2500, rating: "4.6", status: "Active" },
  { id: "PROP-005", title: "Desert Glamping & Jeep Safari", hostName: "Kailash Bhati", location: "Jaisalmer, RJ", type: "Stay", price: 5500, rating: "4.9", status: "Active", breakfastPrice: 400, dinnerPrice: 800, parkingAvailable: false }
];

export const INITIAL_BOOKINGS: SystemBooking[] = [
  { id: "BOK-108", guestName: "Meera Kapoor", propertyName: "The Creek Villa", hostName: "Aryan Singh", amount: 22500, date: "Today, 10:45 AM", status: "Completed" },
  { id: "BOK-107", guestName: "Anuj Sharma", propertyName: "Ganga River Rafting", hostName: "Rakesh Negi", amount: 2400, date: "Yesterday", status: "Completed" },
  { id: "BOK-106", guestName: "Kabir Roy", propertyName: "Mountain View Cottage", hostName: "Sneha Reddy", amount: 16000, date: "15 May, 2026", status: "Upcoming" },
  { id: "BOK-105", guestName: "Shreya Gupta", propertyName: "Desert Glamping Stay", hostName: "Kailash Bhati", amount: 11000, date: "14 May, 2026", status: "Completed" },
  { id: "BOK-104", guestName: "Nikhil Dev", propertyName: "Paragliding Joyride", hostName: "Amit Thakur", amount: 5000, date: "12 May, 2026", status: "Cancelled" }
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: "CPN-01", code: "WELCOME200", discountPercent: 15, type: "Global", targetName: "All Stays & Tours", expiryDate: "30 June, 2026", status: "Active" },
  { id: "CPN-02", code: "HIMALAYANCOZY", discountPercent: 20, type: "Stay-Specific", targetName: "The Creek Villa", expiryDate: "10 June, 2026", status: "Active" },
  { id: "CPN-03", code: "RAFT10", discountPercent: 10, type: "Activity-Specific", targetName: "Ganga River Rafting", expiryDate: "05 June, 2026", status: "Active" }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: "CMP-01", title: "Summer Retreat Email Campaign", targetGroup: "Guests", channel: "AWS SES Email", scheduledTime: "20 May, 2026 - 10:00 AM", status: "Scheduled", analytics: { sent: 0, opens: 0, clicks: 0 } },
  { id: "CMP-02", title: "Monsoon Stay Offer Push Alert", targetGroup: "All Users", channel: "Firebase Push", scheduledTime: "18 May, 2026 (Live)", status: "Sent", analytics: { sent: 12500, opens: 4320, clicks: 1250 } },
  { id: "CMP-03", title: "Host KYC Mandatory Push Alert", targetGroup: "Vendors", channel: "Twilio WhatsApp", scheduledTime: "Immediate", status: "Draft", analytics: { sent: 0, opens: 0, clicks: 0 } }
];

export const INITIAL_ATTRACTIONS: TouristAttraction[] = [
  { id: "ATR-01", name: "Solang Valley Snow Point", location: "Manali, HP", coordinates: "32.3167° N, 77.1500° E", nearbyStaysCount: 8, category: "Adventure" },
  { id: "ATR-02", name: "Triveni Ghat Evening Aarti", location: "Rishikesh, UK", coordinates: "30.1264° N, 78.3011° E", nearbyStaysCount: 12, category: "Spiritual" },
  { id: "ATR-03", name: "Alleppey Houseboat Terminal", location: "Alleppey, KL", coordinates: "9.4981° N, 76.3388° E", nearbyStaysCount: 5, category: "Nature" }
];

export const INITIAL_AUDITS: AuditLog[] = [
  { id: "AUD-001", timestamp: "05:30:12 AM", type: "Webhook", event: "Razorpay Payment success hook: pay_Pz92318xs (₹22,500)", status: "Success" },
  { id: "AUD-002", timestamp: "05:31:02 AM", type: "SQS Queue", event: "AWS SES Dispatch: Booking confirmation sent to meera@gmail.com", status: "Success" },
  { id: "AUD-003", timestamp: "05:32:45 AM", type: "Security", event: "API Rate-limiting warning triggered for IP 192.168.1.108", status: "Success" },
  { id: "AUD-004", timestamp: "05:34:11 AM", type: "Webhook", event: "Razorpay refund event failure: ref_H77123s", status: "Failed" },
  { id: "AUD-005", timestamp: "05:36:20 AM", type: "Security", event: "Blocked rogue access attempt to /api/admin/configs from IP 45.2.12.9", status: "Blocked" }
];
