import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebaseConfig';

const SESSION_KEY = 'user_session_active';

export class SessionService {
  // Store session state in AsyncStorage for quick retrieval
  static async saveSessionState(isActive: boolean): Promise<void> {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
      active: isActive,
      timestamp: Date.now()
    }));
  }

  // Get cached session state (return null if not found or expired)
  static async getCachedSession(): Promise<boolean | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      
      if (!sessionData) return null;
      
      const { active, timestamp } = JSON.parse(sessionData);
      const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      // Check if cached session is still valid
      if (Date.now() - timestamp < SESSION_MAX_AGE) {
        return active;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached session:', error);
      return null;
    }
  }
  
  // Check if user has an active session
  static async isSessionActive(): Promise<boolean> {
    // First try to get from cache
    const cachedSession = await this.getCachedSession();
    if (cachedSession !== null) return cachedSession;
    
    // Otherwise check with Firebase
    const user = auth.currentUser;
    const isActive = !!user;
    
    // Save result to cache
    await this.saveSessionState(isActive);
    
    return isActive;
  }
  
  // Clear session on logout
  static async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}