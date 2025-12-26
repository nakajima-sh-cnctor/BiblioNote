/**
 * Note Entity
 * ドメイン層のエンティティ - ビジネスルールとバリデーションを含む
 */
export class Note {
    constructor({ id, userId, title, content, createdAt, updatedAt }) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content || '';
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /**
     * ノートデータのバリデーション
     * @throws {Error} バリデーションエラー
     */
    validate() {
        if (!this.userId || this.userId.trim() === '') {
            throw new Error('ユーザーIDは必須です');
        }

        if (!this.title || this.title.trim() === '') {
            throw new Error('タイトルは必須です');
        }

        if (this.title.length > 100) {
            throw new Error('タイトルは100文字以内で入力してください');
        }
    }

    /**
     * Firestoreに保存する形式に変換
     */
    toFirestore() {
        return {
            userId: this.userId,
            title: this.title,
            content: this.content,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Firestoreのデータからエンティティを作成
     */
    static fromFirestore(id, data) {
        return new Note({
            id,
            userId: data.userId,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        });
    }
}
