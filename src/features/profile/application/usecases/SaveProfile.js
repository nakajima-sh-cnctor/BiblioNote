import { Profile } from '../../domain/entities/Profile';

/**
 * Save Profile Use Case
 * プロフィール保存ユースケース
 */
export class SaveProfile {
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * プロフィールを保存
     * @param {string} userId - ユーザーID
     * @param {Object} profileData - プロフィールデータ
     * @param {string} profileData.name - 名前
     * @param {string} profileData.gender - 性別
     * @returns {Promise<Profile>} 保存されたプロフィール
     */
    async execute(userId, { name, gender }) {
        // 既存のプロフィールを確認
        const existingProfile = await this.profileRepository.findByUserId(userId);

        let profile;
        if (existingProfile) {
            // 更新の場合
            profile = new Profile({
                userId,
                name,
                gender,
                createdAt: existingProfile.createdAt,
                updatedAt: new Date().toISOString()
            });
        } else {
            // 新規作成の場合
            profile = new Profile({
                userId,
                name,
                gender,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // バリデーション
        profile.validate();

        // 保存
        await this.profileRepository.save(profile);

        return profile;
    }
}
