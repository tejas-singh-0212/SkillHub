import { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

// re-export firebase User
export type { FirebaseUser };

// location
export interface ClientLocation {
 lat: number;
 lng: number;
 city: string;
 area: string;
 fullAddress: string;
}

export interface FirestoreLocation {
 latitude?: number;
 longitude?: number;
 lat?: number;
 lng?: number;
 geohash?: string;
 city: string;
 area: string;
 fullAddress: string;
}

export interface AddressSearchResult {
 lat: number;
 lng: number;
 displayName: string;
 city: string;
 area: string;
}

// skills
export interface SkillCategory {
 id: string;
 icon: string;
 label: string;
}

export interface ProficiencyLevel {
 id: string;
 label: string;
}

export interface PriceTypeOption {
 id: string;
 label: string;
 description: string;
}

export interface PerUnitOption {
 id: string;
 label: string;
 shortLabel: string;
}

export interface SkillOffered {
 id: string;
 name: string;
 category: string;
 level: string;
 description: string;
 priceType: string;
 price: number;
 perUnit: string;
 createdAt: string;
 updatedAt?: string;
}

export interface SkillNeeded {
 id: string;
 name: string;
 category: string;
 description: string;
 createdAt: string;
 updatedAt?: string;
}

export interface NewSkillOfferedInput {
 name: string;
 category: string;
 level?: string;
 description?: string;
 priceType?: string;
 price?: number;
 perUnit?: string;
}

export interface NewSkillNeededInput {
 name: string;
 category: string;
 description?: string;
}

// user profile
export interface UserProfile {
 id: string;
 name: string;
 email: string;
 avatar: string;
 phone: string;
 bio: string;
 location: FirestoreLocation | null;
 skillsOffered: SkillOffered[];
 skillsNeeded: SkillNeeded[];
 averageRating: number;
 totalReviews: number;
 totalBookings: number;
 isVerified: boolean;
 badges: string[];
 onboardingComplete: boolean;
 createdAt: Timestamp | null;
}

export interface ProfileUpdateData {
 name: string;
 bio: string;
 phone?: string;
}

export interface LocationUpdateData {
 lat: number;
 lng: number;
 city?: string;
 area?: string;
 fullAddress?: string;
}

// bookings
export type BookingStatus =
 | "pending"
 | "accepted"
 | "declined"
 | "completed"
 | "cancelled";

export interface BookingCreateData {
 requesterId: string;
 requesterName: string;
 requesterAvatar?: string;
 providerId: string;
 providerName: string;
 providerAvatar?: string;
 skillName: string;
 date: string;
 time: string;
 duration?: number;
 paymentType?: string;
 amount?: number;
 barterExchange?: string;
 message?: string;
}

export interface Booking {
 id: string;
 requesterId: string;
 requesterName: string;
 requesterAvatar: string;
 providerId: string;
 providerName: string;
 providerAvatar: string;
 skillName: string;
 status: BookingStatus;
 scheduledDate: string;
 scheduledTime: string;
 duration: number;
 paymentType: string;
 amount: number;
 barterExchange: string;
 message: string;
 role?: "provider" | "requester";
 createdAt?: Timestamp | null;
 updatedAt?: Timestamp | null;
}

export interface PaginatedBookingsResult {
 bookings: Booking[];
 lastDoc: unknown;
 hasMore: boolean;
}

// messages
export interface ConversationUser {
 id: string;
 name: string;
 avatar: string;
}

export interface Message {
 id: string;
 senderId: string;
 content: string;
 isRead: boolean;
 createdAt?: Timestamp | null;
}

export interface Conversation {
 id: string;
 participants: string[];
 participantNames: Record<string, string>;
 participantAvatars: Record<string, string>;
 lastMessage: string;
 lastMessageTime: Timestamp | null;
 unreadCount: Record<string, number>;
}

export interface OlderMessagesResult {
 messages: Message[];
 hasMore: boolean;
}

// notifications
export type NotificationType =
 | "new_booking"
 | "booking_accepted"
 | "booking_declined"
 | "booking_completed"
 | "booking_cancelled"
 | "new_message"
 | "new_review";

export interface NotificationInput {
 type: NotificationType | string;
 title: string;
 message: string;
 fromUserId?: string;
 bookingId?: string;
 conversationId?: string;
}

export interface AppNotification {
 id: string;
 type: NotificationType | string;
 title: string;
 message: string;
 fromUserId: string;
 bookingId: string;
 conversationId: string;
 isRead: boolean;
 createdAt?: Timestamp | null;
}

// reviews
export interface ReviewData {
 bookingId: string;
 reviewerId: string;
 reviewerName: string;
 reviewerAvatar?: string;
 revieweeId: string;
 rating: number;
 comment?: string;
}

export interface Review {
 id: string;
 bookingId: string;
 reviewerId: string;
 reviewerName: string;
 reviewerAvatar: string;
 revieweeId: string;
 rating: number;
 comment: string;
 createdAt?: Timestamp | null;
}

// search
export interface SearchResult extends UserProfile {
 distance?: number;
 matchingSkills?: SkillOffered[];
}

export interface TextSearchResult {
 results: SearchResult[];
 lastDoc: unknown;
 hasMore: boolean;
}

export interface SmartMatch extends UserProfile {
 matchType: "perfect_barter" | "they_offer";
}

export interface SmartMatchResult {
 matches: SmartMatch[];
 lastDoc: unknown;
 hasMore: boolean;
}

// map
export interface MapPerson {
 id: string;
 name: string;
 avatar: string;
 lat: number;
 lng: number;
 skills: string[];
 rating: number;
 distance?: number;
}

// auth context
export interface AuthContextType {
 user: FirebaseUser | null;
 profile: UserProfile | null;
 loading: boolean;
 refreshProfile: () => Promise<void>;
}

export interface GoogleSignInResult {
 user: FirebaseUser;
 isNewUser: boolean;
 onboardingComplete: boolean;
}
