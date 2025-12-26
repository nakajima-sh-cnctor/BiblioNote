import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { NoteRepository } from '../../domain/repositories/NoteRepository';
import { Note } from '../../domain/entities/Note';

/**
 * Firebase Firestore Note Repository
 * Firestoreを使用したノートリポジトリの実装
 */
export class FirebaseNoteRepository extends NoteRepository {
    constructor() {
        super();
        this.collectionName = 'notes';
    }

    /**
     * ノートを保存（新規作成または更新）
     * @param {Note} note - 保存するノート
     * @returns {Promise<string>} - 保存されたノートのID
     */
    async save(note) {
        try {
            note.validate();

            if (note.id) {
                // Update existing note
                const noteRef = doc(db, this.collectionName, note.id);
                const data = note.toFirestore();
                // Update timestamp
                data.updatedAt = new Date().toISOString();
                await updateDoc(noteRef, data);
                return note.id;
            } else {
                // Create new note
                const collectionRef = collection(db, this.collectionName);
                const docRef = await addDoc(collectionRef, note.toFirestore());
                return docRef.id;
            }
        } catch (error) {
            console.error('Error saving note:', error);
            throw new Error('ノートの保存に失敗しました: ' + error.message);
        }
    }

    /**
     * IDでノートを取得
     * @param {string} id - ノートID
     * @returns {Promise<Note|null>}
     */
    async findById(id) {
        try {
            const noteRef = doc(db, this.collectionName, id);
            const noteSnap = await getDoc(noteRef);

            if (!noteSnap.exists()) {
                return null;
            }

            return Note.fromFirestore(id, noteSnap.data());
        } catch (error) {
            console.error('Error fetching note:', error);
            throw new Error('ノートの取得に失敗しました: ' + error.message);
        }
    }

    /**
     * ユーザーIDでノート一覧を取得
     * @param {string} userId - ユーザーID
     * @returns {Promise<Note[]>}
     */
    async findByUserId(userId) {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const notes = [];

            querySnapshot.forEach((doc) => {
                notes.push(Note.fromFirestore(doc.id, doc.data()));
            });

            // Client-side sort to avoid composite index requirement
            notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            return notes;
        } catch (error) {
            console.error('Error fetching user notes:', error);
            throw new Error('ノート一覧の取得に失敗しました: ' + error.message);
        }
    }
}
