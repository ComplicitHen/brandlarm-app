// Firebase Service - Hanterar all Firebase-kommunikation
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../firebase.config';

let app = null;
let database = null;
let auth = null;
let isInitialized = false;

// Initialisera Firebase
export const initializeFirebase = () => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase är inte konfigurerad. Använder offline-läge.');
      return false;
    }

    if (!isInitialized) {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      auth = getAuth(app);
      isInitialized = true;
      console.log('Firebase initialiserad');
    }
    return true;
  } catch (error) {
    console.error('Firebase initialiseringsfel:', error);
    return false;
  }
};

// Autentisering
export const signInAnonymous = async () => {
  try {
    if (!auth) return null;
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Anonym inloggning misslyckades:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    if (!auth) return null;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Inloggning misslyckades:', error);
    throw error;
  }
};

export const createAccount = async (email, password, displayName) => {
  try {
    if (!auth) return null;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Uppdatera profil med namn
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
  } catch (error) {
    console.error('Kontoregistrering misslyckades:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

export const onAuthChange = (callback) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// Larmhantering
export const publishAlarm = async (alarmData) => {
  try {
    if (!database) {
      console.warn('Firebase inte tillgänglig, larm publiceras inte');
      return null;
    }

    const user = getCurrentUser();
    if (!user) {
      console.warn('Användare inte inloggad, larm publiceras inte');
      return null;
    }

    const alarmsRef = ref(database, 'alarms');
    const newAlarmRef = push(alarmsRef);

    const alarm = {
      ...alarmData,
      timestamp: Date.now(),
      userId: user.uid,
      userName: user.displayName || 'Okänd brandman',
      id: newAlarmRef.key,
    };

    await set(newAlarmRef, alarm);
    console.log('Larm publicerat till Firebase:', alarm);
    return alarm;
  } catch (error) {
    console.error('Kunde inte publicera larm:', error);
    throw error;
  }
};

export const subscribeToAlarms = (callback, limit = 50) => {
  try {
    if (!database) {
      console.warn('Firebase inte tillgänglig');
      return () => {};
    }

    const alarmsRef = ref(database, 'alarms');
    const alarmsQuery = query(alarmsRef, orderByChild('timestamp'), limitToLast(limit));

    return onValue(alarmsQuery, (snapshot) => {
      const alarms = [];
      snapshot.forEach((childSnapshot) => {
        alarms.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Sortera med nyaste först
      alarms.sort((a, b) => b.timestamp - a.timestamp);
      callback(alarms);
    }, (error) => {
      console.error('Fel vid lyssning på larm:', error);
    });
  } catch (error) {
    console.error('Kunde inte prenumerera på larm:', error);
    return () => {};
  }
};

export const getAlarmHistory = async (limit = 100) => {
  try {
    if (!database) return [];

    const alarmsRef = ref(database, 'alarms');
    const alarmsQuery = query(alarmsRef, orderByChild('timestamp'), limitToLast(limit));

    const snapshot = await get(alarmsQuery);
    const alarms = [];

    snapshot.forEach((childSnapshot) => {
      alarms.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    // Sortera med nyaste först
    return alarms.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Kunde inte hämta larmhistorik:', error);
    return [];
  }
};

// Användarstatus (online/offline, tillgänglighet)
export const updateUserStatus = async (status) => {
  try {
    if (!database) return;

    const user = getCurrentUser();
    if (!user) return;

    const userStatusRef = ref(database, `userStatus/${user.uid}`);
    await set(userStatusRef, {
      ...status,
      lastUpdated: Date.now(),
      userId: user.uid,
      userName: user.displayName || 'Okänd'
    });
  } catch (error) {
    console.error('Kunde inte uppdatera användarstatus:', error);
  }
};

export const subscribeToUserStatus = (callback) => {
  try {
    if (!database) return () => {};

    const statusRef = ref(database, 'userStatus');
    return onValue(statusRef, (snapshot) => {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        users.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(users);
    });
  } catch (error) {
    console.error('Kunde inte prenumerera på användarstatus:', error);
    return () => {};
  }
};

export const isFirebaseReady = () => isInitialized;
