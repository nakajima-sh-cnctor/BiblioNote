/**
 * @fileoverview CheckProfileExists Use Case テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、プロフィール存在確認機能を提供する `CheckProfileExists` ユースケースの設計仕様と動作を定義します。
 * 
 * ## アーキテクチャ
 * - **レイヤー**: Application Layer (Use Case)
 * - **パターン**: Clean Architecture
 * - **依存関係**: ProfileRepository (Domain Layer)
 * 
 * ## 責務
 * - ユーザーIDを受け取り、プロフィールの存在を確認する
 * - 存在する場合は true、存在しない場合は false を返す
 * - 不正な入力値に対しても安全に false を返す
 * 
 * ## ビジネスルール
 * - ユーザーIDが空文字、null、undefined の場合は false を返す(エラーをスローしない)
 * - 存在確認は boolean 値のみを返す
 * - 複数ユーザーの存在確認を正しく処理する
 * 
 * ## 戻り値仕様
 * - プロフィール存在時: true
 * - プロフィール未登録時: false
 * - 不正な入力値: false (エラーをスローしない)
 * 
 * ## GetProfile との違い
 * - GetProfile: プロフィールデータを取得(null または Profile)
 * - CheckProfileExists: 存在確認のみ(boolean)
 * - CheckProfileExists は軽量な存在確認に最適
 * 
 * ## テスト戦略
 * - モックリポジトリを使用してユニットテストを実施
 * - 正常系、異常系、エッジケースをカバー
 * - 戻り値が常に boolean であることを検証
 * 
 * @module features/profile/application/usecases/__tests__/CheckProfileExists.test
 * @requires vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CheckProfileExists } from '../CheckProfileExists';
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
 * @description CheckProfileExists Use Case のメインテストスイート
 * 
 * ## テスト対象
 * CheckProfileExists ユースケースの以下の機能:
 * - execute(userId): ユーザーIDでプロフィールの存在を確認
 * - 不正値のハンドリング
 * - 複数ユーザーの存在確認
 */
describe('CheckProfileExists Use Case', () => {
    let checkProfileExists;
    let mockRepository;

    beforeEach(() => {
        mockRepository = new MockProfileRepository();
        checkProfileExists = new CheckProfileExists(mockRepository);
    });

    /**
     * @description プロフィール存在確認機能の仕様
     * 
     * ## 機能要件
     * - ユーザーIDを指定してプロフィールの存在を確認
     * - 存在する場合は true を返す
     * - 存在しない場合は false を返す
     * - 不正な入力値に対しても false を返す(エラーをスローしない)
     * 
     * ## ビジネスルール
     * - 存在確認は軽量な操作であるべき
     * - エラーをスローせず、常に boolean を返す
     */
    describe('プロフィール存在確認', () => {
        /**
         * @test プロフィール存在時の動作
         * 
         * ## 検証項目
         * 1. 事前に保存されたプロフィールに対して true が返ること
         * 
         * ## 期待される動作
         * - 入力: 存在するユーザーID
         * - 出力: true
         */
        it('should return true if profile exists', async () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male'
            });
            await mockRepository.save(profile);

            const result = await checkProfileExists.execute('user123');

            expect(result).toBe(true);
        });

        /**
         * @test プロフィールが存在しない時の動作
         * 
         * ## 検証項目
         * 1. 存在しないユーザーIDに対して false が返ること
         * 
         * ## 期待される動作
         * - 入力: 存在しないユーザーID
         * - 出力: false
         */
        it('should return false if profile does not exist', async () => {
            const result = await checkProfileExists.execute('nonexistent');

            expect(result).toBe(false);
        });

        /**
         * @test 空文字のハンドリング
         * 
         * ## 検証項目
         * 1. userId が空文字の場合、false が返ること(エラーをスローしない)
         * 
         * ## 期待される動作
         * - 入力: 空文字
         * - 出力: false
         * 
         * ## GetProfile との違い
         * - GetProfile: 空文字でエラーをスロー
         * - CheckProfileExists: 空文字で false を返す
         */
        it('should return false for empty userId', async () => {
            const result = await checkProfileExists.execute('');

            expect(result).toBe(false);
        });

        /**
         * @test null 値のハンドリング
         * 
         * ## 検証項目
         * 1. userId が null の場合、false が返ること(エラーをスローしない)
         * 
         * ## 期待される動作
         * - 入力: null
         * - 出力: false
         */
        it('should return false for null userId', async () => {
            const result = await checkProfileExists.execute(null);

            expect(result).toBe(false);
        });

        /**
         * @test undefined 値のハンドリング
         * 
         * ## 検証項目
         * 1. userId が undefined の場合、false が返ること(エラーをスローしない)
         * 
         * ## 期待される動作
         * - 入力: undefined
         * - 出力: false
         */
        it('should return false for undefined userId', async () => {
            const result = await checkProfileExists.execute(undefined);

            expect(result).toBe(false);
        });
    });

    /**
     * @description 複数ユーザーの存在確認仕様
     * 
     * ## 機能要件
     * - 複数のユーザーのプロフィール存在を正しく確認できる
     * - 各ユーザーのデータが混同しない
     */
    describe('複数ユーザー', () => {
        /**
         * @test 複数ユーザーの存在確認
         * 
         * ## 検証項目
         * 1. 複数のプロフィールが保存されている場合、各ユーザーの存在確認が正しく動作すること
         * 2. 存在するユーザーに対して true が返ること
         * 3. 存在しないユーザーに対して false が返ること
         * 
         * ## 期待される動作
         * - 入力: 複数のユーザーID(存在するものと存在しないもの)
         * - 出力: 各ユーザーIDに対応する正しい boolean 値
         */
        it('should correctly check existence for multiple users', async () => {
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

            const exists1 = await checkProfileExists.execute('user1');
            const exists2 = await checkProfileExists.execute('user2');
            const exists3 = await checkProfileExists.execute('user3');

            expect(exists1).toBe(true);
            expect(exists2).toBe(true);
            expect(exists3).toBe(false);
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
     * - 返り値が常に boolean であることを検証
     */
    describe('エッジケース', () => {
        /**
         * @test 特殊文字を含む userId の処理
         * 
         * ## 検証項目
         * 1. 特殊文字(@, #等)を含む userId でも正しく動作すること
         * 2. 存在する場合は true が返ること
         * 
         * ## 期待される動作
         * - 入力: 特殊文字を含む userId
         * - 出力: true
         */
        it('should handle special characters in userId', async () => {
            const specialUserId = 'user@123#test';
            const profile = new Profile({
                userId: specialUserId,
                name: 'テストユーザー',
                gender: 'other'
            });
            await mockRepository.save(profile);

            const result = await checkProfileExists.execute(specialUserId);

            expect(result).toBe(true);
        });

        /**
         * @test 返り値の型検証
         * 
         * ## 検証項目
         * 1. 返り値が boolean 型であること
         * 
         * ## 期待される動作
         * - 入力: 任意の userId
         * - 出力: boolean 型の値
         * 
         * ## 型安全性
         * - 存在確認は必ず boolean を返す
         * - truthy/falsy な値ではなく、厳密な true/false を返す
         */
        it('should return boolean type', async () => {
            const result = await checkProfileExists.execute('anyuser');

            expect(typeof result).toBe('boolean');
        });

        /**
         * @test 非常に長い userId の処理
         * 
         * ## 検証項目
         * 1. 非常に長い userId でも正しく動作すること
         * 2. 存在する場合は true が返ること
         * 
         * ## 期待される動作
         * - 入力: 1000文字の userId
         * - 出力: true
         * 
         * ## パフォーマンス考慮事項
         * - 長い文字列でもパフォーマンスが低下しないことを確認
         */
        it('should handle very long userId', async () => {
            const longUserId = 'a'.repeat(1000);
            const profile = new Profile({
                userId: longUserId,
                name: 'テストユーザー',
                gender: 'male'
            });
            await mockRepository.save(profile);

            const result = await checkProfileExists.execute(longUserId);

            expect(result).toBe(true);
        });
    });
});
