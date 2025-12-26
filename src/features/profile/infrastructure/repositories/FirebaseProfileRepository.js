import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { Profile } from '../../domain/entities/Profile';

/**
 * Firebase Firestore Profile Repository
 * Firestoreを使用したプロフィールリポジトリの実装
 */
export class FirebaseProfileRepository extends ProfileRepository {
    constructor() {
        super();
        this.collectionName = 'profiles';
    }

    /**
     * プロフィールを保存（新規作成または更新）
     * @param {Profile} profile - 保存するプロフィール
     */
    async save(profile) {
        try {
            profile.validate();
            const profileRef = doc(db, this.collectionName, profile.userId);
            await setDoc(profileRef, profile.toFirestore());
        } catch (error) {
            console.error('Error saving profile:', error);
            throw new Error('プロフィールの保存に失敗しました: ' + error.message);
        }
    }

    /**
     * ユーザーIDでプロフィールを取得
     * @param {string} userId - ユーザーID
     * @returns {Promise<Profile|null>}
     */
    async findByUserId(userId) {
        try {
            const profileRef = doc(db, this.collectionName, userId);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                return null;
            }

            return Profile.fromFirestore(userId, profileSnap.data());
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw new Error('プロフィールの取得に失敗しました: ' + error.message);
        }
    }

    /**
     * プロフィールが存在するか確認
     * @param {string} userId - ユーザーID
     * @returns {Promise<boolean>}
     */
    async exists(userId) {
        try {
            const profile = await this.findByUserId(userId);
            return profile !== null;
        } catch (error) {
            console.error('Error checking profile existence:', error);
            return false;
        }
    }

    /**
     * プロフィールを更新
     * @param {Profile} profile - 更新するプロフィール
     */
    async update(profile) {
        profile.updatedAt = new Date().toISOString();
        await this.save(profile);
    }
}
