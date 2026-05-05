/**
 * Gerenciamento de sessão do recrutador ctBlun.
 * Usa SecureStore no nativo e localStorage na web para persistir o JWT.
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const RECRUITER_TOKEN_KEY = "ctblun_recruiter_token";
const RECRUITER_INFO_KEY = "ctblun_recruiter_info";

export type RecruiterInfo = {
  id: number;
  name: string;
  email: string;
};

export async function getRecruiterToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(RECRUITER_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(RECRUITER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setRecruiterToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(RECRUITER_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(RECRUITER_TOKEN_KEY, token);
}

export async function removeRecruiterToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(RECRUITER_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(RECRUITER_TOKEN_KEY);
}

export async function getRecruiterInfo(): Promise<RecruiterInfo | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === "web") {
      raw = localStorage.getItem(RECRUITER_INFO_KEY);
    } else {
      raw = await SecureStore.getItemAsync(RECRUITER_INFO_KEY);
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setRecruiterInfo(info: RecruiterInfo): Promise<void> {
  const raw = JSON.stringify(info);
  if (Platform.OS === "web") {
    localStorage.setItem(RECRUITER_INFO_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(RECRUITER_INFO_KEY, raw);
}

export async function clearRecruiterSession(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(RECRUITER_TOKEN_KEY);
    localStorage.removeItem(RECRUITER_INFO_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(RECRUITER_TOKEN_KEY);
  await SecureStore.deleteItemAsync(RECRUITER_INFO_KEY);
}
