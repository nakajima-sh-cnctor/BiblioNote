/**
 * Get User Notes Use Case
 * ユーザーのノート一覧取得ユースケース
 */
export class GetUserNotes {
    constructor(noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * 指定ユーザーのノート一覧を取得
     * @param {string} userId - ユーザーID
     * @returns {Promise<Note[]>} ノートのリスト
     */
    async execute(userId) {
        if (!userId) {
            throw new Error('ユーザーIDは必須です');
        }
        return await this.noteRepository.findByUserId(userId);
    }
}
