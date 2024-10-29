import { db } from './config';
import {
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

export const addUser = async (user) => {
  try {
    const userRef = doc(collection(db, "users"));
    await setDoc(userRef, user);
    return { id: userRef.id, ...user };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUser = async (userID) => {
  try {
    const userDoc = doc(db, "users", userID);
    const foundUser = await getDoc(userDoc);
    if (foundUser.exists()) {
      return foundUser.data();
    } else {
      throw new Error("No such user!");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, userData);
    return { id: userId, ...userData };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    return userId;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addMaintenanceRequest = async (maintenanceRequestData) => {
  try {
    const maintenanceRequestRef = doc(collection(db, "maintenance-requests"));
    await setDoc(maintenanceRequestRef, maintenanceRequestData);
    return { id: maintenanceRequestRef.id, ...maintenanceRequestData };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getMaintenanceRequestsByUnit = async (unit) => {
  let docs = [];

  try {
    const requestsRef = collection(db, "maintenance-requests");
    const requestsQuery = query(requestsRef, where("unit", "==", unit));

    const requestDocs = await getDocs(requestsQuery);
    requestDocs.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (error) {
    throw new Error(error.message);
  }

  return docs;
};

export const getAllMaintenanceRequests = async () => {
  let docs = [];

  try {
    const requestsRef = collection(db, "maintenance-requests");
    const requestDocs = await getDocs(requestsRef);
    requestDocs.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (error) {
    throw new Error(error.message);
  }

  return docs;
};

export const updateMaintenanceRequest = async (updateID, updateData) => {
  try {
    const updateRef = doc(db, "maintenance-requests", updateID);
    await updateDoc(updateRef, updateData);
    return { id: updateID, ...updateData };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addNotice = async (noticeData) => {
  try {
    const noticeRef = doc(collection(db, "notices"));
    await setDoc(noticeRef, noticeData);
    return { id: noticeRef.id, ...noticeData };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getNotices = async () => {
  try {
    const noticesRef = collection(db, "notices");
    const noticesData = await getDocs(noticesRef);
    const docs = noticesData.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return docs;
  } catch (error) {
    throw new Error("Failed to fetch notices");
  }
};

export const addLease = async (leaseData) => {
  try {
    const leaseRef = doc(collection(db, "leases"));
    await setDoc(leaseRef, leaseData);
    return { id: leaseRef.id, ...leaseData };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getLease = async (unit) => {
  try {
    const leaseRef = collection(db, "leases");
    const leaseQuery = query(leaseRef, where("unit", "==", unit));
    const leaseDoc = await getDocs(leaseQuery);
    const leases = leaseDoc.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return leases;
  } catch (error) {
    throw new Error(error.message);
  }
};