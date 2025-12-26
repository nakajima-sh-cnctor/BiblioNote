/**
 * Profile Repository Interface
 * リポジトリの抽象クラス - 実装の詳細を隠蔽
 */
export class ProfileRepository {
    /**
     * プロフィールを保存
     * @param {Profile} profile - 保存するプロフィール
     * @returns {Promise<void>}
     */
    async save(profile) {
        throw new Error('save() must be implemented');
    }

    /**
     * ユーザーIDでプロフィールを取得
     * @param {string} userId - ユーザーID
     * @returns {Promise<Profile|null>} プロフィール、存在しない場合はnull
     */
    async findByUserId(userId) {
        throw new Error('findByUserId() must be implemented');
    }

    /**
     * プロフィールが存在するか確認
     * @param {string} userId - ユーザーID
     * @returns {Promise<boolean>} 存在する場合true
     */
    async exists(userId) {
        throw new Error('exists() must be implemented');
    }

    /**
     * プロフィールを更新
     * @param {Profile} profile - 更新するプロフィール
     * @returns {Promise<void>}
     */
    async update(profile) {
        throw new Error('update() must be implemented');
    }
}
