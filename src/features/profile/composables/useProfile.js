import { ref } from 'vue';
import { auth } from '../../../firebase';
import { FirebaseProfileRepository } from '../infrastructure/repositories/FirebaseProfileRepository';
import { SaveProfile } from '../application/usecases/SaveProfile';
import { GetProfile } from '../application/usecases/GetProfile';
import { CheckProfileExists } from '../application/usecases/CheckProfileExists';

// リポジトリのシングルトンインスタンス
const profileRepository = new FirebaseProfileRepository();

// ユースケースのインスタンス
const saveProfileUseCase = new SaveProfile(profileRepository);
const getProfileUseCase = new GetProfile(profileRepository);
const checkProfileExistsUseCase = new CheckProfileExists(profileRepository);

const profile = ref(null);
const isLoading = ref(false);
const error = ref(null);

const useProfile = () => {
    /**
     * プロフィールの存在確認
     * @returns {Promise<boolean>}
     */
    const checkProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return false;

        try {
            return await checkProfileExistsUseCase.execute(currentUser.uid);
        } catch (err) {
            console.error('Error checking profile:', err);
            return false;
        }
    };

    /**
     * プロフィールの保存
     * @param {Object} profileData - プロフィールデータ
     * @returns {Promise<boolean>}
     */
    const saveProfile = async (profileData) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            error.value = 'ユーザーが認証されていません';
            return false;
        }

        try {
            isLoading.value = true;
            error.value = null;

            const savedProfile = await saveProfileUseCase.execute(
                currentUser.uid,
                profileData
            );

            profile.value = savedProfile;
            isLoading.value = false;
            return true;
        } catch (err) {
            console.error('Error saving profile:', err);
            error.value = err.message || 'プロフィールの保存に失敗しました';
            isLoading.value = false;
            return false;
        }
    };

    /**
     * プロフィールの読み込み
     * @returns {Promise<Profile|null>}
     */
    const loadProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;

        try {
            isLoading.value = true;
            error.value = null;

            const loadedProfile = await getProfileUseCase.execute(currentUser.uid);
            profile.value = loadedProfile;
            isLoading.value = false;
            return loadedProfile;
        } catch (err) {
            console.error('Error loading profile:', err);
            error.value = err.message || 'プロフィールの読み込みに失敗しました';
            isLoading.value = false;
            return null;
        }
    };

    return {
        profile,
        isLoading,
        error,
        checkProfile,
        saveProfile,
        loadProfile
    };
};

export default useProfile;
