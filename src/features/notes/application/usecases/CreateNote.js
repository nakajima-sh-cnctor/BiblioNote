import { Note } from '../../domain/entities/Note';

/**
 * Create Note Use Case
 * ノート作成/保存のユースケース
 */
export class CreateNote {
    constructor(noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * ノートを作成または更新する
     * @param {Object} params
     * @param {string} [params.id] - 既存ノートの場合のID
     * @param {string} params.userId - ユーザーID
     * @param {string} params.title - タイトル
     * @param {string} params.content - 内容
     * @param {string[]} [params.tags] - タグ (任意)
     * @returns {Promise<string>} - 保存されたノートのID
     */
    async execute({ id, userId, title, content, tags }) {
        // Create note entity
        // If id exists, it will be treated as an update by the repository logic
        // but typically use cases might be separated (Create vs Update).
        // For simplicity here, we handle both or just creation.
        // Since we are passing ID, we can fetch first or constructing new Note with ID.
        // Repository handles upsert logic based on ID.

        const note = new Note({
            id,
            userId,
            title,
            content,
            tags
        });

        note.validate();

        return await this.noteRepository.save(note);
    }
}
