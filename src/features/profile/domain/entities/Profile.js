/**
 * Profile Entity
 * ドメイン層のエンティティ - ビジネスルールとバリデーションを含む
 */
export class Profile {
    constructor({ userId, name, gender, createdAt, updatedAt }) {
        this.userId = userId;
        this.name = name;
        this.gender = gender;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /**
     * プロフィールデータのバリデーション
     * @throws {Error} バリデーションエラー
     */
    validate() {
        if (!this.userId || this.userId.trim() === '') {
            throw new Error('ユーザーIDは必須です');
        }

        if (!this.name || this.name.trim() === '') {
            throw new Error('名前は必須です');
        }

        if (this.name.length > 50) {
            throw new Error('名前は50文字以内で入力してください');
        }

        if (!this.gender || !['male', 'female', 'other'].includes(this.gender)) {
            throw new Error('性別を選択してください');
        }
    }

    /**
     * Firestoreに保存する形式に変換
     */
    toFirestore() {
        return {
            name: this.name,
            gender: this.gender,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Firestoreのデータからエンティティを作成
     */
    static fromFirestore(userId, data) {
        return new Profile({
            userId,
            name: data.name,
            gender: data.gender,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        });
    }
}
