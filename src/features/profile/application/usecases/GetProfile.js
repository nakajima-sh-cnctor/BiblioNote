/**
 * Get Profile Use Case
 * プロフィール取得ユースケース
 */
export class GetProfile {
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * ユーザーIDでプロフィールを取得
     * @param {string} userId - ユーザーID
     * @returns {Promise<Profile|null>} プロフィール、存在しない場合はnull
     */
    async execute(userId) {
        if (!userId) {
            throw new Error('ユーザーIDが指定されていません');
        }

        return await this.profileRepository.findByUserId(userId);
    }
}
