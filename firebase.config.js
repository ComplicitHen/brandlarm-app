// Firebase Configuration
// Du måste ersätta dessa värden med dina egna från Firebase Console
// Gå till: https://console.firebase.google.com/
// Välj ditt projekt > Project Settings > General > Your apps

export const firebaseConfig = {
  apiKey: "AIzaSyCw1Lf0LuKjc5G0FMB3I-jK9HyJdN1ZU6w",
  authDomain: "firefighter-training-app-c860e.firebaseapp.com",
  databaseURL: "https://firefighter-training-app-c860e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "firefighter-training-app-c860e",
  storageBucket: "firefighter-training-app-c860e.firebasestorage.app",
  messagingSenderId: "547675013657",
  appId: "1:547675013657:web:b36576e4c2a9d6cf4e6088",
  measurementId: "G-KF85975BP9"
};

// Exportera en flagga för att kontrollera om Firebase är konfigurerad
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "DIN_API_KEY_HÄR";
};
