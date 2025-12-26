/**
 * Note Repository Interface
 * ドメイン層のリポジトリインターフェース
 */
export class NoteRepository {
    /**
     * ノートを保存
     * @param {Note} note 
     */
    async save(note) {
        throw new Error('Method not implemented.');
    }

    /**
     * IDでノートを取得
     * @param {string} id 
     */
    async findById(id) {
        throw new Error('Method not implemented.');
    }

    /**
     * ユーザーIDでノート一覧を取得
     * @param {string} userId 
     */
    async findByUserId(userId) {
        throw new Error('Method not implemented.');
    }
}
