/**
 * @fileoverview GetProfile Use Case テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、プロフィール取得機能を提供する `GetProfile` ユースケースの設計仕様と動作を定義します。
 * 
 * ## アーキテクチャ
 * - **レイヤー**: Application Layer (Use Case)
 * - **パターン**: Clean Architecture
 * - **依存関係**: ProfileRepository (Domain Layer)
 * 
 * ## 責務
 * - ユーザーIDを受け取り、対応するプロフィールを取得する
 * - プロフィールが存在しない場合は null を返す
 * - 入力値のバリデーションを実行する
 * 
 * ## ビジネスルール
 * - ユーザーIDは必須項目
 * - ユーザーIDが空文字、null、undefined の場合はエラーをスロー
 * - 存在しないユーザーIDの場合は null を返す
 * 
 * ## 戻り値仕様
 * - 成功時: Profile エンティティのインスタンス
 * - プロフィール未登録時: null
 * - バリデーションエラー時: エラーをスロー
 * 
 * ## テスト戦略
 * - モックリポジトリを使用してユニットテストを実施
 * - 正常系、異常系、エッジケースをカバー
 * - ドメインエンティティの整合性を検証
 * 
 * @module features/profile/application/usecases/__tests__/GetProfile.test
 * @requires vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GetProfile } from '../GetProfile';
import { Profile } from '../../../domain/entities/Profile';

/**
 * @class MockProfileRepository
 * @description テスト用のモックリポジトリ実装
 * 
 * ## 目的
 * - インメモリでプロフィールデータを管理
 * - 実際のデータベース接続なしでユースケースをテスト
 * 
 * ## 実装メソッド
 * - save(profile): プロフィールを保存
 * - findByUserId(userId): ユーザーIDでプロフィールを検索
 * - exists(userId): プロフィールの存在確認
 */
class MockProfileRepository {
    constructor() {
        this.profiles = new Map();
    }

    async save(profile) {
        this.profiles.set(profile.userId, profile);
    }

    async findByUserId(userId) {
        return this.profiles.get(userId) || null;
    }

    async exists(userId) {
        return this.profiles.has(userId);
    }
}

/**
 * @description GetProfile Use Case のメインテストスイート
 * 
 * ## テスト対象
 * GetProfile ユースケースの以下の機能:
 * - execute(userId): ユーザーIDでプロフィールを取得
 * - バリデーションロジック
 * - エラーハンドリング
 */
describe('GetProfile Use Case', () => {
    let getProfile;
    let mockRepository;

    beforeEach(() => {
        mockRepository = new MockProfileRepository();
        getProfile = new GetProfile(mockRepository);
    });

    /**
     * @description プロフィール取得機能の仕様
     * 
     * ## 機能要件
     * - ユーザーIDを指定してプロフィールを取得
     * - 存在する場合は Profile エンティティを返す
     * - 存在しない場合は null を返す
     * - 複数ユーザーのプロフィールを正しく区別する
     */
    describe('プロフィール取得', () => {
        /**
         * @test プロフィール取得成功シナリオ
         * 
         * ## 検証項目
         * 1. 事前に保存されたプロフィールが取得できること
         * 2. 取得したプロフィールの userId が正しいこと
         * 3. 取得したプロフィールの name が正しいこと
         * 4. 取得したプロフィールの gender が正しいこと
         * 
         * ## 期待される動作
         * - 入力: 存在するユーザーID
         * - 出力: 対応する Profile エンティティ
         */
        it('should get existing profile', async () => {
            // プロフィールを事前に保存
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            });
            await mockRepository.save(profile);

            const result = await getProfile.execute('user123');

            expect(result).toBeDefined();
            expect(result.userId).toBe('user123');
            expect(result.name).toBe('山田太郎');
            expect(result.gender).toBe('male');
        });

        /**
         * @test プロフィールが存在しないケース
         * 
         * ## 検証項目
         * 1. 存在しないユーザーIDで検索した場合、null が返ること
         * 
         * ## 期待される動作
         * - 入力: 存在しないユーザーID
         * - 出力: null
         * 
         * ## ビジネスルール
         * - プロフィール未登録のユーザーはエラーではなく null を返す
         * - 呼び出し元でプロフィール未登録状態を判定できるようにする
         */
        it('should return null if profile does not exist', async () => {
            const result = await getProfile.execute('nonexistent');

            expect(result).toBeNull();
        });

        /**
         * @test 複数ユーザーのプロフィールを正しく区別する
         * 
         * ## 検証項目
         * 1. 複数のプロフィールが保存されている場合、正しいプロフィールが取得できること
         * 2. 他のユーザーのプロフィールと混同しないこと
         * 
         * ## 期待される動作
         * - 入力: 複数のユーザーID
         * - 出力: 各ユーザーIDに対応する正しい Profile エンティティ
         * 
         * ## データ分離の確認
         * - ユーザーID をキーとしてプロフィールが正しく分離されていることを検証
         */
        it('should return correct profile for different users', async () => {
            // 複数のプロフィールを保存
            const profile1 = new Profile({
                userId: 'user1',
                name: '山田太郎',
                gender: 'male'
            });
            const profile2 = new Profile({
                userId: 'user2',
                name: '山田花子',
                gender: 'female'
            });

            await mockRepository.save(profile1);
            await mockRepository.save(profile2);

            const result1 = await getProfile.execute('user1');
            const result2 = await getProfile.execute('user2');

            expect(result1.name).toBe('山田太郎');
            expect(result2.name).toBe('山田花子');
        });
    });

    /**
     * @description 入力値バリデーションの仕様
     * 
     * ## バリデーションルール
     * - userId は必須パラメータ
     * - 空文字、null、undefined は許可されない
     * - バリデーションエラー時は明確なエラーメッセージを返す
     * 
     * ## エラーメッセージ
     * - "ユーザーIDが指定されていません"
     */
    describe('バリデーション', () => {
        /**
         * @test 空文字のバリデーション
         * 
         * ## 検証項目
         * 1. userId が空文字の場合、エラーがスローされること
         * 2. エラーメッセージが適切であること
         */
        it('should throw error if userId is not provided', async () => {
            await expect(
                getProfile.execute('')
            ).rejects.toThrow('ユーザーIDが指定されていません');
        });

        /**
         * @test null 値のバリデーション
         * 
         * ## 検証項目
         * 1. userId が null の場合、エラーがスローされること
         * 2. エラーメッセージが適切であること
         */
        it('should throw error if userId is null', async () => {
            await expect(
                getProfile.execute(null)
            ).rejects.toThrow('ユーザーIDが指定されていません');
        });

        /**
         * @test undefined 値のバリデーション
         * 
         * ## 検証項目
         * 1. userId が undefined の場合、エラーがスローされること
         * 2. エラーメッセージが適切であること
         */
        it('should throw error if userId is undefined', async () => {
            await expect(
                getProfile.execute(undefined)
            ).rejects.toThrow('ユーザーIDが指定されていません');
        });
    });

    /**
     * @description エッジケースの仕様
     * 
     * ## テスト対象
     * - 特殊文字を含む userId
     * - 非常に長い userId
     * - 返り値の型検証
     * 
     * ## 目的
     * - 通常ではない入力値でも正しく動作することを確認
     * - データ型の整合性を検証
     */
    describe('エッジケース', () => {
        /**
         * @test 特殊文字を含む userId の処理
         * 
         * ## 検証項目
         * 1. 特殊文字(@, #等)を含む userId でも正しく動作すること
         * 2. プロフィールが正しく取得できること
         * 
         * ## 期待される動作
         * - 入力: 特殊文字を含む userId
         * - 出力: 対応する Profile エンティティ
         */
        it('should handle special characters in userId', async () => {
            const specialUserId = 'user@123#test';
            const profile = new Profile({
                userId: specialUserId,
                name: 'テストユーザー',
                gender: 'other'
            });
            await mockRepository.save(profile);

            const result = await getProfile.execute(specialUserId);

            expect(result).toBeDefined();
            expect(result.userId).toBe(specialUserId);
        });

        /**
         * @test 返り値の型検証
         * 
         * ## 検証項目
         * 1. 返り値が Profile エンティティのインスタンスであること
         * 
         * ## 期待される動作
         * - 入力: 任意の有効な userId
         * - 出力: Profile インスタンス
         * 
         * ## ドメイン整合性
         * - ユースケースは必ずドメインエンティティを返す
         * - プレーンなオブジェクトではなく、エンティティインスタンスを返すことでドメインロジックを保証
         */
        it('should return Profile instance', async () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male'
            });
            await mockRepository.save(profile);

            const result = await getProfile.execute('user123');

            expect(result).toBeInstanceOf(Profile);
        });
    });
});
