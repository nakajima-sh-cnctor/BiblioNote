/**
 * Check Profile Exists Use Case
 * プロフィール存在確認ユースケース
 */
export class CheckProfileExists {
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * プロフィールが存在するか確認
     * @param {string} userId - ユーザーID
     * @returns {Promise<boolean>} 存在する場合true
     */
    async execute(userId) {
        if (!userId) {
            return false;
        }

        return await this.profileRepository.exists(userId);
    }
}
