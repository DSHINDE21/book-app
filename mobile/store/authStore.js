/* eslint-disable no-unused-expressions */
import { create } from "zustand";
import { AsyncStorage } from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (username, email, password) => {
    try {
      set({ isLoading: true });
      const response = await fetch(
        "https://book-app-4db1.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Something went wrong");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data?.user));
      await AsyncStorage.setItem("token", data?.token);
      // Update state with user and token on success
      set({
        token: data?.token,
        user: data?.user,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error?.message };
    }
  },
}));
