import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Party, PartyStatus } from '../types';

const PARTIES_COLLECTION = 'parties';

export const subscribeToParties = (callback: (parties: Party[]) => void) => {
  const q = query(collection(db, PARTIES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const parties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Party));
    callback(parties);
  });
};

export const createParty = async (partyData: Omit<Party, 'id'>) => {
  return await addDoc(collection(db, PARTIES_COLLECTION), partyData);
};

export const joinParty = async (partyId: string, userId: string, displayName: string) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, {
    participants: arrayUnion(userId),
    [`participantNames.${userId}`]: displayName
  });
};

export const leaveParty = async (partyId: string, userId: string) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, {
    participants: arrayRemove(userId),
    [`orders.${userId}`]: deleteField(),
    [`participantNames.${userId}`]: deleteField()
  });
};

export const closeParty = async (partyId: string) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, {
    status: PartyStatus.CLOSED
  });
};

export const voteOption = async (partyId: string, optionId: string, userId: string, party: Party) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  
  const newOptions = party.voteOptions?.map(opt => {
    // Remove user's vote from all options
    const newVotes = opt.votes.filter(uid => uid !== userId);
    // Add to the selected one
    if (opt.id === optionId) {
      newVotes.push(userId);
    }
    return { ...opt, votes: newVotes };
  });

  await updateDoc(partyRef, {
    voteOptions: newOptions
  });
};

export const updateOrder = async (partyId: string, userId: string, menu: string) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, {
    [`orders.${userId}`]: menu
  });
};

export const addVoteOption = async (partyId: string, name: string) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, {
    voteOptions: arrayUnion({
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      votes: []
    })
  });
};

export const updateUserFCMToken = async (userId: string, token: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { fcmToken: token }, { merge: true });
};
