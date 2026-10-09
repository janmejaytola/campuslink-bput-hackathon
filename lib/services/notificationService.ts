import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PersistentNotification, NotificationType } from '@/types/notification';

const inMemoryNotifications: Map<string, PersistentNotification> = new Map();

function getCollectionRef() {
  if (typeof window !== 'undefined' && db) {
    return collection(db, 'notifications');
  }
  return null;
}

export const notificationService = {
  async createNotification(params: {
    userId: string;
    role: 'STUDENT' | 'RECRUITER' | 'PLACEMENT_OFFICER';
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: PersistentNotification['metadata'];
  }): Promise<PersistentNotification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: PersistentNotification = {
      id,
      userId: params.userId,
      role: params.role,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
      read: false,
      createdAt: now,
    };

    inMemoryNotifications.set(id, record);

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'notifications', id);
        await setDoc(docRef, record);
      } catch (err) {
        console.warn('[notificationService.createNotification] Firestore fallback to memory:', err);
      }
    }

    return record;
  },

  async getNotificationsForUser(userId: string): Promise<PersistentNotification[]> {
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const q = query(colRef, where('userId', '==', userId));
        const snap = await getDocs(q);
        const results: PersistentNotification[] = [];
        snap.forEach((d) => {
          const item = d.data() as PersistentNotification;
          results.push(item);
          inMemoryNotifications.set(item.id, item);
        });
        if (results.length > 0) {
          return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('[notificationService.getNotificationsForUser] Firestore fallback to memory:', err);
      }
    }

    const memoryList = Array.from(inMemoryNotifications.values()).filter((n) => n.userId === userId);
    return memoryList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markAsRead(notificationId: string): Promise<void> {
    const existing = inMemoryNotifications.get(notificationId);
    if (existing) {
      existing.read = true;
      inMemoryNotifications.set(notificationId, existing);
    }

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'notifications', notificationId);
        await setDoc(docRef, { read: true }, { merge: true });
      } catch (err) {
        console.warn('[notificationService.markAsRead] Firestore fallback:', err);
      }
    }
  },
};
