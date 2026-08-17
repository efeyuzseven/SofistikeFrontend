export const customerSegments = [
  "Yeni Müşteri",
  "Aktif Müşteri",
  "Sadık Müşteri",
  "VIP Müşteri",
  "Risk Altında",
  "Pasif Müşteri",
] as const;

export const customerStatuses = ["Aktif", "Pasif"] as const;
export const registrationChannels = [
  "Web sitesi",
  "Pazaryeri",
  "E-ihracat",
] as const;

export type CustomerSegment = (typeof customerSegments)[number];
export type CustomerStatus = (typeof customerStatuses)[number];
export type RegistrationChannel = (typeof registrationChannels)[number];
export type PermissionFilter = "Tümü" | "İzinli" | "İzinsiz";
export type CustomerDetailTab =
  "overview" | "orders" | "addresses" | "permissions" | "notes";

export type CustomerOrder = {
  orderNumber: string;
  date: string;
  itemCount: number;
  amount: number;
  orderStatus:
    | "Yeni"
    | "Hazırlanıyor"
    | "Kargoya Verildi"
    | "Teslim Edildi"
    | "İptal Edildi";
  paymentStatus: "Ödendi" | "Ödeme Bekliyor" | "İade Edildi";
};

export type CustomerAddress = {
  id: string;
  title: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
};

export type CommunicationPermissions = {
  email: boolean;
  sms: boolean;
  campaign: boolean;
  updatedAt: string;
};

export type CustomerAdminNote = {
  id: string;
  text: string;
  adminName: string;
  date: string;
};

export type AdminCustomer = {
  id: number;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  registrationChannel: RegistrationChannel;
  registrationDate: string;
  city: string;
  country: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate?: string;
  loyaltyPoints: number;
  permissions: CommunicationPermissions;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
  notes: CustomerAdminNote[];
};
